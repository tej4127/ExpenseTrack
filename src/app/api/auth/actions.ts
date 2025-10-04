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
    const { companyName, country, currency, name, email, password } = values;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Check if any company exists. We'll use this to determine if this is the first signup.
    const companyCount = await prisma.company.count();

    if (companyCount === 0) {
      // This is the first user. Create the company and the user as ADMIN in a transaction.
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
      // A company already exists. Join the first one found as an EMPLOYEE.
      const company = await prisma.company.findFirst();
      if (!company) {
        // This case should theoretically not happen if companyCount > 0, but it's good practice to handle it.
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
