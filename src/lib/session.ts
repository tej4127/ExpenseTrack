import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/lib/types';
import { add, isPast } from 'date-fns';

const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function createSession(userId: string, role: string, companyId: string) {
  const expires = add(new Date(), {
    minutes: Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION?.replace('m','')) || 15
  });

  const sessionPayload: SessionPayload = { userId, role, companyId, expires: expires.toISOString() };

  const session = await encrypt(sessionPayload);

  cookies().set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const sessionCookie = cookies().get('session')?.value;
  return await decrypt(sessionCookie);
}

export async function deleteSession() {
  cookies().delete('session');
}
