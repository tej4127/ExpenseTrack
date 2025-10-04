import 'server-only';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}:${salt}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [hashedPassword, salt] = storedHash.split(':');
  if (!hashedPassword || !salt) {
    return false;
  }
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  
  // timingSafeEqual is crucial to prevent timing attacks
  return timingSafeEqual(buf, hashedPasswordBuf);
}
