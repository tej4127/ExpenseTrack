'use server';
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/lib/types';
import { add } from 'date-fns';

// Use a hardcoded secret to ensure consistency between signing and verification
// in all server environments.
const secretKey = "a-secure-secret-for-jwt-that-is-long-enough-and-is-not-in-an-env-file";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Omit<SessionPayload, 'expires'>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    // The payload from jwtVerify is the session data. We add the expires property
    // back in here, based on the cookie's lifetime, if needed elsewhere.
    // For the middleware's purposes, just getting the payload is enough.
    const expires = add(new Date(), { hours: 1 });
    return { ...payload, expires: expires.toISOString() } as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function createSession(userId: string, role: string, companyId: string) {
  const expires = add(new Date(), { hours: 1 });
  // We no longer store the 'expires' in the JWT payload itself.
  const sessionPayload: Omit<SessionPayload, 'expires'> = { userId, role, companyId };

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
