'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';

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
  try {
    const user = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const passwordMatch = await bcrypt.compare(values.password, user.passwordHash);

    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    await createSession(user.id, user.role, user.companyId);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    
    const passwordHash = await bcrypt.hash(values.password, 12);

    let company = await prisma.company.findFirst();
    let role = 'EMPLOYEE';

    // If no company exists, this is the first user. Create the company and make them an admin.
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: values.companyName,
          country: values.country,
          currency: values.currency,
        },
      });
      role = 'ADMIN';
    }

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        passwordHash,
        role: role,
        companyId: company.id,
      },
    });

    await createSession(user.id, user.role, user.companyId);

    return { success: true };
  } catch (error) {
    console.error('Error during signup:', error);
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}
