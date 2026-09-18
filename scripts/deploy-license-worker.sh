#!/usr/bin/env bash
# Deploys packages/license-worker to Cloudflare Workers. One-time prerequisites in .env:
#   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, STRIPE_WEBHOOK_SECRET, LICENSE_SIGNING_KEY,
#   RESEND_API_KEY, ADMIN_TOKEN
# Usage: bash scripts/deploy-license-worker.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a
for v in CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID STRIPE_WEBHOOK_SECRET LICENSE_SIGNING_KEY RESEND_API_KEY ADMIN_TOKEN; do
  [ -n "${!v:-}" ] || { echo "missing $v in .env"; exit 1; }
done
npm run build >/dev/null
cd packages/license-worker
# Create the KV namespace once and write its id into wrangler.toml.
if grep -q REPLACE_AFTER wrangler.toml; then
  id=$(npx --yes wrangler@latest kv namespace create LICENSES --preview false 2>&1 | grep -oE 'id = "[a-f0-9]+"' | head -1 | cut -d'"' -f2)
  [ -n "$id" ] || { echo "could not create KV namespace"; exit 1; }
  sed -i "s/REPLACE_AFTER_wrangler_kv_namespace_create_LICENSES/$id/" wrangler.toml
  echo "KV namespace LICENSES = $id (wrangler.toml updated — commit it)"
fi
for s in STRIPE_WEBHOOK_SECRET LICENSE_SIGNING_KEY RESEND_API_KEY ADMIN_TOKEN; do
  printf '%s' "${!s}" | npx --yes wrangler@latest secret put "$s" >/dev/null
done
npx --yes wrangler@latest deploy
echo "Now point Stripe's webhook at https://foundry-licenses.<your-subdomain>.workers.dev/stripe/webhook (checkout.session.completed)"
