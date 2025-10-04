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
    console.error(error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
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
      // First user ever, create company and make them an ADMIN
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
      return { success: true };

    } else {
      // Subsequent user, join the first company as an EMPLOYEE
      const company = await prisma.company.findFirst();
      if (!company) {
        // This case should ideally not happen if companyCount > 0, but it's a good safeguard.
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
      return { success: true };
    }

  } catch (error) {
    console.error('Error during signup:', error);
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}
