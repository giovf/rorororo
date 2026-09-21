// Shared client for gankdat-backed Apify actors: paginates a dataset query,
// pushes records to the run's dataset and charges one pay-per-event "result"
// per record, stopping cleanly at the user's spending limit.
import { Actor, log } from 'apify';

const API = 'https://gankdat.com/v1/data';
const PER_PAGE = 100;

/**
 * @param {string} dataset   gankdat dataset slug
 * @param {Record<string, string|number|boolean|undefined>} filters query params
 * @param {number} maxResults hard cap from the actor input
 */
export async function runDatasetActor(dataset, filters, maxResults) {
  const key = process.env.GANKDAT_API_KEY;
  if (!key) throw new Error('GANKDAT_API_KEY is not configured on this actor');
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
  let page = 1;
  let pushed = 0;
  let total = null;
  for (;;) {
    const qs = new URLSearchParams({ ...params, page: String(page), per_page: String(PER_PAGE) });
    const res = await fetch(`${API}/${dataset}?${qs}`, {
      headers: { authorization: `Bearer ${key}`, 'user-agent': 'gankdat-apify-actor/1.0' },
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') ?? '5') * 1000;
      log.warning(`Rate limited by the API; waiting ${wait} ms`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`gankdat API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = await res.json();
    const records = body.data ?? [];
    total = body.meta?.total ?? total;
    if (page === 1) log.info(`${total ?? '?'} matching records; returning up to ${maxResults}`);
    for (const record of records) {
      if (pushed >= maxResults) break;
      const charge = await Actor.charge({ eventName: 'result' });
      if (charge.eventChargeLimitReached) {
        log.warning(
          'Spending limit reached; stopping. Raise the max total charge to get more results.',
        );
        await Actor.setStatusMessage(`Stopped at ${pushed} results (spending limit).`);
        return pushed;
      }
      await Actor.pushData(record);
      pushed += 1;
    }
    if (pushed >= maxResults || records.length < PER_PAGE) break;
    page += 1;
  }
  await Actor.setStatusMessage(
    `Done: ${pushed} results (${total ?? 0} matched, refreshed daily from the official source).`,
  );
  return pushed;
}
