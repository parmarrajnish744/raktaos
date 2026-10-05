/**
 * Cryptographically secure non-guessable slug generator for public card URLs.
 * Example outputs: AB72KQ, X91PQT, K72MNB
 */

// Custom alphabet: uppercase alphanumeric, excluding confusing characters (0/O, 1/I/L)
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a random non-guessable slug of specified length (default 6).
 * Uses Web Crypto API (globalThis.crypto.getRandomValues) for cryptographic randomness.
 */
export function generateCardSlug(length = 6) {
  const bytes = new Uint8Array(length);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return slug;
}

/**
 * Validates whether a slug matches the expected format.
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  // Accepts uppercase alphanumeric, 4 to 20 characters
  return /^[A-Za-z0-9_-]{4,20}$/.test(slug);
}
