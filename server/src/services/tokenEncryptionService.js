import crypto from 'crypto';
import { config } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte Buffer key from the configured hex string or passphrase
 */
function getKeyBuffer() {
  const rawKey = config.credentialEncryptionKey;
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }
  // Deterministic 32-byte sha256 derivation if rawKey is arbitrary string
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypts a plaintext string (e.g. OAuth token) using AES-256-GCM
 * Output format: iv_hex:authTag_hex:ciphertext_hex
 */
export function encryptToken(plainText) {
  if (!plainText) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKeyBuffer();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string
 * Input format: iv_hex:authTag_hex:ciphertext_hex
 */
export function decryptToken(encryptedPayload) {
  if (!encryptedPayload) return null;

  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const key = getKeyBuffer();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[EncryptionService] Decryption failed:', err.message);
    return null;
  }
}
