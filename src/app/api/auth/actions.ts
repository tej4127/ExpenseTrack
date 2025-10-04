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
  console.log('--- SIGNUP ACTION START ---');
  try {
    const { companyName, country, currency, name, email, password } = values;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const passwordHash = await hashPassword(password);
    
    const companyCount = await prisma.company.count();

    if (companyCount === 0) {
      const user = await prisma.$transaction(async (tx) => {
        const newCompany = await tx.company.create({
          data: {
            name: companyName,
            country: country,
            currency: currency,
          },
        });

        const newUser = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: 'ADMIN',
            companyId: newCompany.id,
          },
        });
        return newUser;
      });

      await createSession(user.id, user.role, user.companyId);
      console.log('--- SIGNUP ACTION SUCCESS (ADMIN) ---');
      return { success: true };

    } else {
      const company = await prisma.company.findFirst();
      if (!company) {
        // This case should theoretically not happen if companyCount > 0
        return { success: false, error: 'Could not find a company to join.' };
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'EMPLOYEE',
          companyId: company.id,
        },
      });

      await createSession(user.id, user.role, user.companyId);
      console.log('--- SIGNUP ACTION SUCCESS (EMPLOYEE) ---');
      return { success: true };
    }

  } catch (error) {
    console.error('--- SIGNUP ACTION FAILED ---');
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } else {
        console.error('An unexpected error object:', error);
    }
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}
