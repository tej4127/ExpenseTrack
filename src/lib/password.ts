'use server';
import 'server-only';
import { pbkdf2 } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(pbkdf2);

export async function hashPassword(password: string): Promise<string> {
  const salt = Buffer.from(crypto.getRandomValues(new Uint8Array(16)));
  const hash = (await scryptAsync(password, salt, 64, {N:16384, r:8, p:1})) as Buffer;
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const hash = (await scryptAsync(password, salt, 64, {N:16384, r:8, p:1})) as Buffer;
  return hash.toString('hex') === hashHex;
}
