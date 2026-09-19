// Chrome Web Store Publish API helper. Needs CWS_CLIENT_ID / CWS_CLIENT_SECRET in .env and,
// once, CWS_AUTH_CODE (see docs/for-owner/actions/006). Commands:
//   token            exchange CWS_AUTH_CODE for a refresh token (prints the .env line to add)
//   upload <id> <zip> upload a new version of an existing item
//   publish <id>     publish the uploaded version (review starts)
//   insert <zip>     create a NEW item (the listing must then be completed in the dashboard)
import { readFile } from 'node:fs/promises';
import process from 'node:process';

const env = process.env;
const need = (k: string): string => {
  const v = env[k];
  if (!v) throw new Error(`missing ${k} in .env`);
  return v;
};

async function accessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: need('CWS_CLIENT_ID'),
    client_secret: need('CWS_CLIENT_SECRET'),
    refresh_token: need('CWS_REFRESH_TOKEN'),
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!json.access_token) throw new Error(`token: ${json.error} ${json.error_description ?? ''}`);
  return json.access_token;
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === 'token') {
  const body = new URLSearchParams({
    code: need('CWS_AUTH_CODE'),
    client_id: need('CWS_CLIENT_ID'),
    client_secret: need('CWS_CLIENT_SECRET'),
    redirect_uri: 'http://localhost:1/',
    grant_type: 'authorization_code',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
  const json = (await res.json()) as {
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!json.refresh_token)
    throw new Error(
      `exchange failed: ${json.error} ${json.error_description ?? ''} (codes expire in ~10 min; get a fresh one)`,
    );
  console.log(`CWS_REFRESH_TOKEN="${json.refresh_token}"`);
} else if (cmd === 'upload' && a && b) {
  const token = await accessToken();
  const res = await fetch(`https://www.googleapis.com/upload/chromewebstore/v1.1/items/${a}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'x-goog-api-version': '2' },
    body: await readFile(b),
  });
  console.log(res.status, await res.text());
} else if (cmd === 'publish' && a) {
  const token = await accessToken();
  const res = await fetch(`https://www.googleapis.com/chromewebstore/v1.1/items/${a}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'x-goog-api-version': '2', 'Content-Length': '0' },
  });
  console.log(res.status, await res.text());
} else if (cmd === 'insert' && a) {
  const token = await accessToken();
  const res = await fetch('https://www.googleapis.com/upload/chromewebstore/v1.1/items', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'x-goog-api-version': '2' },
    body: await readFile(a),
  });
  console.log(res.status, await res.text());
} else {
  console.log('usage: cws-publish token | upload <itemId> <zip> | publish <itemId> | insert <zip>');
  process.exit(1);
}
