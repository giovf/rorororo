// Generates the Ed25519 signing key pair for license keys. Run ONCE per portfolio:
//   npm run licensing:keygen
// Put the private key in .env as LICENSE_SIGNING_KEY (never commit it); embed the
// public key in products.
import { generateKeyPair } from '@foundry/licensing';

const { publicKey, privateKey } = await generateKeyPair();
console.log(`LICENSE_SIGNING_KEY="${privateKey}"   # .env only`);
console.log(`LICENSE_PUBLIC_KEY="${publicKey}"    # safe to embed in products`);
