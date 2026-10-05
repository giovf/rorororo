// Shared client for gankdat-backed Apify actors: paginates a dataset query (or, in changes
// mode, the register's change feed), pushes records to the run's dataset and charges one
// pay-per-event "result" per record, stopping cleanly at the user's spending limit.
import { Actor, log } from 'apify';

const API = 'https://gankdat.com/v1';
const PER_PAGE = 100;

/**
 * @param {string} dataset   gankdat dataset slug
 * @param {Record<string, string|number|boolean|undefined>} filters query params
 * @param {number} maxResults hard cap from the actor input
 * @param {{ mode?: string, since?: string, change?: string }} [feed] changes mode: rows added,
 *   removed or changed since `since` (default: the last 7 days), optionally one `change` kind;
 *   each pushed item is the record plus `change` and `changed_at`. Only registers with a stable
 *   record id have a feed (the API answers 404 otherwise) — the actor input offers the mode
 *   only there.
 */
export async function runDatasetActor(dataset, filters, maxResults, feed = {}) {
  const key = process.env.GANKDAT_API_KEY;
  if (!key) throw new Error('GANKDAT_API_KEY is not configured on this actor');
  const changes = feed.mode === 'changes';
  const params = Object.fromEntries(
    Object.entries({
      ...filters,
      ...(changes ? { since: feed.since, change: feed.change } : {}),
    }).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
  const url = `${API}/${changes ? 'changes' : 'data'}/${dataset}`;
  let page = 1;
  let pushed = 0;
  let total = null;
  for (;;) {
    const qs = new URLSearchParams({ ...params, page: String(page), per_page: String(PER_PAGE) });
    const res = await fetch(`${url}?${qs}`, {
      headers: { authorization: `Bearer ${key}`, 'user-agent': 'gankdat-apify-actor/1.1' },
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') ?? '5') * 1000;
      log.warning(`Rate limited by the API; waiting ${wait} ms`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`gankdat API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = await res.json();
    const rows = body.data ?? [];
    total = body.meta?.total ?? total;
    if (page === 1) {
      log.info(
        changes
          ? `${total ?? '?'} changes since ${body.meta?.since ?? feed.since ?? '7 days ago'}; returning up to ${maxResults}`
          : `${total ?? '?'} matching records; returning up to ${maxResults}`,
      );
    }
    for (const row of rows) {
      if (pushed >= maxResults) break;
      const charge = await Actor.charge({ eventName: 'result' });
      if (charge.eventChargeLimitReached) {
        log.warning(
          'Spending limit reached; stopping. Raise the max total charge to get more results.',
        );
        await Actor.setStatusMessage(`Stopped at ${pushed} results (spending limit).`);
        return pushed;
      }
      await Actor.pushData(
        changes ? { ...row.record, change: row.change, changed_at: row.changed_at } : row,
      );
      pushed += 1;
    }
    if (pushed >= maxResults || rows.length < PER_PAGE) break;
    page += 1;
  }
  await Actor.setStatusMessage(
    changes
      ? `Done: ${pushed} changes (${total ?? 0} since ${feed.since ?? '7 days ago'}; schedule this run daily to monitor the register).`
      : `Done: ${pushed} results (${total ?? 0} matched, refreshed daily from the official source).`,
  );
  return pushed;
}
