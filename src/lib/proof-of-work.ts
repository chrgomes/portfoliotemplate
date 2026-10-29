/**
 * Self-hosted spam check (proof of work), used by the Angular contact form.
 * The static build has the same logic in tools/static/client/site.js.
 *
 * contact.php hands out a signed challenge; the browser finds the number that produces
 * the challenge hash and sends it back with the message. Cheap for one visitor, costly
 * for a bot sending thousands. The payload format matches ALTCHA (https://altcha.org).
 */

interface Challenge {
  algorithm: 'SHA-256';
  challenge: string;
  maxnumber: number;
  salt: string;
  signature: string;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Fetch a challenge and solve it. Resolves to the base64 payload for the `altcha` field. */
export async function solveChallenge(url: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('The spam check needs a secure (https) connection.');
  }
  const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new Error('The spam check couldn’t start. Reload the page and try again.');
  const ch = (await res.json()) as Challenge;
  for (let n = 0; n <= ch.maxnumber; n++) {
    if ((await sha256Hex(ch.salt + n)) === ch.challenge) {
      return btoa(JSON.stringify({ algorithm: ch.algorithm, challenge: ch.challenge, number: n, salt: ch.salt, signature: ch.signature }));
    }
  }
  throw new Error('The spam check couldn’t finish. Reload the page and try again.');
}
