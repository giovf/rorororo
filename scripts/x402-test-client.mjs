#!/usr/bin/env node
// x402 test client — pays for ONE /x402 request on Base Sepolia with test USDC,
// so you can watch the pay-per-request flow settle to your receiving wallet.
//
//   PRIVATE_KEY=0xYOUR_TEST_WALLET_KEY node scripts/x402-test-client.mjs
//
// Use a THROWAWAY Base Sepolia wallet as the BUYER — funded with test USDC
// (from faucet.circle.com). It must be a DIFFERENT wallet from your receiving
// address (you can't pay yourself). NEVER use a mainnet key; never share it.
//
// Note: signing the payment is gasless (EIP-3009) — the facilitator submits the
// transaction and pays gas — so the buyer wallet mainly needs test USDC.
import { wrapFetchWithPayment } from 'x402-fetch';
import { privateKeyToAccount } from 'viem/accounts';

const TARGET = 'https://faceless-api.faceless-api.workers.dev/x402/data/uk-tenders?per_page=2';

// MetaMask exports the key as 64 hex chars, usually WITHOUT the 0x prefix.
// Accept it either way (and trim stray whitespace).
const raw = (process.env.PRIVATE_KEY ?? '').trim().replace(/^0x/i, '');
if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
  console.error(
    'Set PRIVATE_KEY to your BUYER wallet key: 64 hex characters (0x optional).\n' +
      'In MetaMask: Account menu (⋮) → Account details → Show private key.\n' +
      'If you see 12/24 words, that is your Secret Recovery Phrase — do NOT use that here.',
  );
  process.exit(1);
}
const pk = `0x${raw}`;

const account = privateKeyToAccount(pk);
console.log('Buyer wallet (paying from):', account.address);
console.log('Calling:', TARGET, '\n');

const fetchWithPay = wrapFetchWithPayment(fetch, account);

try {
  const res = await fetchWithPay(TARGET);
  console.log('HTTP status:', res.status);
  const settlement = res.headers.get('x-payment-response');
  if (settlement) console.log('Settlement receipt (X-PAYMENT-RESPONSE, base64):', settlement);
  const body = await res.json();
  console.log('\nData received:\n', JSON.stringify(body, null, 2).slice(0, 700));
  console.log(
    '\n✅ Paid request succeeded. Check both wallets on https://sepolia.basescan.org' +
      ' — test USDC moved from the buyer to your receiving address.',
  );
} catch (err) {
  console.error('\n❌ Failed:', err?.message || err);
  console.error(
    'Common causes: buyer wallet has no Base Sepolia test USDC, or you used the receiving wallet as the buyer.',
  );
  process.exit(1);
}
