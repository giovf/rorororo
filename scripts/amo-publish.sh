#!/usr/bin/env bash
# Submits a Firefox build to addons.mozilla.org (listed channel → AMO review).
# Usage: bash scripts/amo-publish.sh <venture-folder>   e.g. ventures/read-focus
# Needs AMO_JWT_ISSUER and AMO_JWT_SECRET in .env (owner action #6).
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a
: "${AMO_JWT_ISSUER:?missing AMO_JWT_ISSUER in .env}"; : "${AMO_JWT_SECRET:?missing AMO_JWT_SECRET in .env}"
v="${1:?venture folder}"
(cd "$v" && node build.js --firefox >/dev/null)
npx --yes web-ext@latest sign --channel listed --source-dir "$v/dist-firefox" --artifacts-dir "$v/web-ext-artifacts" \
  --api-key "$AMO_JWT_ISSUER" --api-secret "$AMO_JWT_SECRET"
