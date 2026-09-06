import crypto from 'crypto';
import { config } from '../config/env.js';

const algorithm = 'aes-256-cbc';

const normalizeHex = (value: string): string => value.trim().replace(/^0x/, '').toLowerCase();

const buildKey = (rawKey: string): Buffer => {
  const normalized = normalizeHex(rawKey);
  if (/^[0-9a-f]{64}$/.test(normalized)) {
    return Buffer.from(normalized, 'hex');
  }
  // Fallback: derive a stable 32-byte key from provided value.
  return crypto.createHash('sha256').update(rawKey).digest();
};

const buildIv = (rawIv: string): Buffer => {
  const normalized = normalizeHex(rawIv);
  if (/^[0-9a-f]{32}$/.test(normalized)) {
    return Buffer.from(normalized, 'hex');
  }
  // Fallback: derive a stable 16-byte IV from provided value.
  return crypto.createHash('md5').update(rawIv).digest();
};

const key = buildKey(config.security.encryptionKey);
const iv = buildIv(config.security.encryptionIV);

export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

