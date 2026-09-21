#!/usr/bin/env node
// CI: push every Apify actor whose folder changed in this push (or all with --all), then make
// sure each actor on the account is priced (pay-per-event `result`, US$0.001) and, when the
// account is allowed to, public. Needs APIFY_TOKEN and GANKDAT_INTERNAL_API_KEY. Idempotent.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const token = process.env.APIFY_TOKEN;
const serviceKey = process.env.GANKDAT_INTERNAL_API_KEY;
if (!token || !serviceKey) {
  console.error('APIFY_TOKEN / GANKDAT_INTERNAL_API_KEY missing');
  process.exit(1);
}
const root = 'ventures/gankdat/apify';
const all = process.argv.includes('--all');
const range = process.env.DIFF_RANGE ?? 'HEAD~1..HEAD';
const changed = all
  ? readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [
      ...new Set(
        execSync(`git diff --name-only ${range} -- ${root}`, { encoding: 'utf8' })
          .split('\n')
          .map((p) => p.split('/')[3])
          .filter(Boolean),
      ),
    ];
const sh = (cmd, opts = {}) =>
  execSync(cmd, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: { ...process.env, APIFY_DISABLE_KEYRING: '1' },
    ...opts,
  });
sh(`npx --yes apify-cli@latest login --token "${token}"`);
sh(`npx apify-cli secrets add gankdatApiKey "${serviceKey}" || true`);
for (const dir of changed) {
  if (!existsSync(`${root}/${dir}/.actor/actor.json`)) continue;
  const out = sh('npx apify-cli push --wait-for-finish 900 --force', { cwd: `${root}/${dir}` });
  const build = /^Build: (\w+)/m.exec(out)?.[1] ?? 'unknown';
  console.log(`${dir}: build ${build}`);
  if (build !== 'SUCCEEDED') process.exitCode = 1;
}
// Pricing + publication for every actor on the account.
const H = { Authorization: `Bearer ${token}`, 'content-type': 'application/json' };
const acts = (
  await (await fetch('https://api.apify.com/v2/acts?my=true&limit=100', { headers: H })).json()
).data.items;
for (const a of acts) {
  const g = (await (await fetch(`https://api.apify.com/v2/acts/${a.id}`, { headers: H })).json())
    .data;
  const body = {};
  if (!g.pricingInfos?.length) {
    body.pricingInfos = [
      {
        pricingModel: 'PAY_PER_EVENT',
        pricingPerEvent: {
          actorChargeEvents: {
            result: {
              eventTitle: 'Result (one record)',
              eventDescription: 'One record written to the dataset',
              eventPriceUsd: 0.001,
            },
          },
        },
      },
    ];
    body.categories = ['LEAD_GENERATION', 'BUSINESS'];
    body.seoTitle = (g.seoTitle ?? g.title ?? '').slice(0, 60);
    body.seoDescription = (g.seoDescription ?? g.description ?? '').slice(0, 160);
  }
  if (!g.isPublic) body.isPublic = true;
  if (Object.keys(body).length === 0) {
    console.log(`${g.name}: priced, public`);
    continue;
  }
  const r = await fetch(`https://api.apify.com/v2/acts/${a.id}`, {
    method: 'PUT',
    headers: H,
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (j.error?.type === 'cannot-publish-actor' && body.isPublic) {
    delete body.isPublic;
    const r2 = Object.keys(body).length
      ? await fetch(`https://api.apify.com/v2/acts/${a.id}`, {
          method: 'PUT',
          headers: H,
          body: JSON.stringify(body),
        })
      : { ok: true };
    console.log(
      `${g.name}: publish blocked by Apify's new-publisher limit${Object.keys(body).length ? `; pricing ${r2.ok ? 'set' : 'failed'}` : ''}`,
    );
    continue;
  }
  console.log(
    `${g.name}: ${j.error ? 'ERR ' + j.error.type : 'updated (' + Object.keys(body).join(', ') + ')'}`,
  );
}
