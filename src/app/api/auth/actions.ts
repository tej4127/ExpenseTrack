'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const signupSchema = z.object({
  companyName: z.string().min(2),
  country: z.string().min(2),
  currency: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function login(values: z.infer<typeof loginSchema>) {
  console.log('--- LOGIN ACTION START ---');
  
  // Dummy user bypass
  if (values.email === 'admin@example.com' && values.password === 'password') {
    console.log('Dummy admin login successful.');
    // Create a session for a dummy admin user
    // NOTE: This user might not exist in the database, but it will let you into the app.
    // Some features that rely on a DB user record might not work as expected.
    await createSession('dummy-admin-id', 'ADMIN', 'dummy-company-id');
    return { success: true };
  }

  // Original login logic (will likely fail, but kept for future restoration)
  try {
    const user = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (!user || !user.passwordHash) {
      console.error('Login failed: User not found or password not set for', values.email);
      return { success: false, error: 'Invalid email or password.' };
    }
    
    const passwordMatch = await verifyPassword(values.password, user.passwordHash);

    if (!passwordMatch) {
      console.error('Login failed: Password mismatch for', values.email);
      return { success: false, error: 'Invalid email or password.' };
    }
    
    await createSession(user.id, user.role, user.companyId);
    console.log('--- LOGIN ACTION SUCCESS ---');
    return { success: true };
  } catch (error) {
    console.error('--- LOGIN ACTION FAILED ---');
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } else {
        console.error('An unexpected error object:', error);
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  console.log('--- SIGNUP ACTION DISABLED ---');
  return { success: false, error: 'Signup is temporarily disabled. Please use the dummy login: admin@example.com / password' };
}
