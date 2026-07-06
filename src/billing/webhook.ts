import type Stripe from 'stripe';
import { PAID_PLANS, planByLookupKey } from './plans';
import { keyCacheKey } from '../auth/middleware';

// Grants happen ONLY on invoice.paid (fires for the first payment and every
// renewal); checkout.session.completed just links customer ↔ key ↔ plan.
// This split avoids double-granting on subscription creation and keeps
// renewals working with zero extra code.

function log(event: string, fields: Record<string, unknown>): void {
  console.log(JSON.stringify({ level: 'info', event, ...fields }));
}

async function invalidateKeyRecord(env: CloudflareBindings, keyId: string): Promise<void> {
  const row = await env.DB.prepare('SELECT key_hash FROM api_keys WHERE id = ?1')
    .bind(keyId)
    .first<{ key_hash: string }>();
  if (row) await env.CACHE.delete(keyCacheKey(row.key_hash));
}

async function customerLink(
  env: CloudflareBindings,
  customerId: string,
): Promise<{ key_id: string; plan: string | null } | null> {
  return env.DB.prepare('SELECT key_id, plan FROM stripe_customers WHERE stripe_customer_id = ?1')
    .bind(customerId)
    .first<{ key_id: string; plan: string | null }>();
}

function customerIdOf(customer: string | { id: string } | null | undefined): string | null {
  if (!customer) return null;
  return typeof customer === 'string' ? customer : customer.id;
}

async function onCheckoutCompleted(
  env: CloudflareBindings,
  event: Stripe.Event,
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const keyId = session.metadata?.keyId ?? session.client_reference_id;
  const plan = session.metadata?.plan;
  const customerId = customerIdOf(session.customer);
  if (!keyId || !plan || !customerId || !(plan in PAID_PLANS)) {
    log('stripe_event_skipped', { type: event.type, id: event.id, reason: 'missing metadata' });
    return;
  }
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO stripe_customers (stripe_customer_id, key_id, plan, status)
       VALUES (?1, ?2, ?3, 'active')
       ON CONFLICT (stripe_customer_id)
       DO UPDATE SET plan = ?3, status = 'active', updated_at = datetime('now')`,
    ).bind(customerId, keyId, plan),
    env.DB.prepare('UPDATE api_keys SET plan = ?2 WHERE id = ?1').bind(keyId, plan),
  ]);
  await invalidateKeyRecord(env, keyId);
  log('stripe_customer_linked', { keyId, plan, customerId });
}

async function onInvoicePaid(env: CloudflareBindings, event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const meta = invoice.parent?.subscription_details?.metadata ?? {};
  let keyId: string | undefined = meta.keyId;
  let plan: string | undefined = meta.plan;

  const customerId = customerIdOf(invoice.customer);
  if ((!keyId || !plan) && customerId) {
    const link = await customerLink(env, customerId);
    keyId ??= link?.key_id;
    plan ??= link?.plan ?? undefined;
  }
  if (!keyId || !plan || !(plan in PAID_PLANS)) {
    log('stripe_event_skipped', { type: event.type, id: event.id, reason: 'unresolvable key/plan' });
    return;
  }

  const credits = PAID_PLANS[plan]!.credits;
  try {
    // Unique index on stripe_ref makes replays a no-op (idempotency).
    await env.DB.prepare(
      'INSERT INTO credit_ledger (key_id, delta, reason, stripe_ref) VALUES (?1, ?2, ?3, ?4)',
    )
      .bind(keyId, credits, `stripe:${plan}`, event.id)
      .run();
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      log('stripe_event_replayed', { type: event.type, id: event.id });
      return;
    }
    throw err;
  }
  await invalidateKeyRecord(env, keyId);
  log('stripe_credits_granted', { keyId, plan, credits, eventId: event.id });
}

async function onSubscriptionChanged(
  env: CloudflareBindings,
  event: Stripe.Event,
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = customerIdOf(subscription.customer);
  if (!customerId) return;
  const link = await customerLink(env, customerId);
  if (!link) {
    log('stripe_event_skipped', { type: event.type, id: event.id, reason: 'unknown customer' });
    return;
  }

  const deleted = event.type === 'customer.subscription.deleted';
  const lookupKey = subscription.items?.data?.[0]?.price?.lookup_key ?? null;
  const plan = deleted ? 'free' : (lookupKey && planByLookupKey(lookupKey)) || link.plan;
  const status = deleted ? 'canceled' : subscription.status;

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE stripe_customers SET plan = ?2, status = ?3, updated_at = datetime('now')
       WHERE stripe_customer_id = ?1`,
    ).bind(customerId, plan, status),
    env.DB.prepare('UPDATE api_keys SET plan = ?2 WHERE id = ?1').bind(link.key_id, plan),
  ]);
  await invalidateKeyRecord(env, link.key_id);
  log('stripe_subscription_changed', { keyId: link.key_id, plan, status });
}

export async function handleStripeEvent(
  env: CloudflareBindings,
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      return onCheckoutCompleted(env, event);
    case 'invoice.paid':
      return onInvoicePaid(env, event);
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return onSubscriptionChanged(env, event);
    default:
      log('stripe_event_unhandled', { type: event.type, id: event.id });
  }
}
