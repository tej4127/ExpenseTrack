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
  // Dummy user bypass
  if (values.email === 'admin@example.com' && values.password === 'password') {
    // NOTE: This user might not exist in the database, but it will let you into the app.
    await createSession('dummy-admin-id', 'ADMIN', 'dummy-company-id');
    return { success: true };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: 'Invalid email or password.' };
    }
    
    const passwordMatch = await verifyPassword(values.password, user.passwordHash);

    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }
    
    await createSession(user.id, user.role, user.companyId);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
        console.error('Login Error:', error.message);
    } else {
        console.error('An unexpected error object:', error);
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  return { success: false, error: 'Signup is temporarily disabled. Please use the dummy login: admin@example.com / password' };
}
