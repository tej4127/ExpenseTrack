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

    // Transaction to ensure atomicity
    const user = await prisma.$transaction(async (tx) => {
        const companyCount = await tx.company.count();
        let company;
        let userRole: 'ADMIN' | 'EMPLOYEE';

        if (companyCount === 0) {
            // First user, create the company and set user as ADMIN
            userRole = 'ADMIN';
            company = await tx.company.create({
                data: {
                    name: values.companyName,
                    country: values.country,
                    currency: values.currency,
                },
            });
        } else {
            // Subsequent users join the first company as an EMPLOYEE
            // This is simplified for the demo. A real app would have invites.
            userRole = 'EMPLOYEE';
            company = await tx.company.findFirst();
            if (!company) {
                // This should theoretically not happen if companyCount > 0
                throw new Error("Could not find a company to join.");
            }
        }

        const newUser = await tx.user.create({
            data: {
              name: values.name,
              email: values.email,
              passwordHash,
              role: userRole,
              companyId: company.id,
            },
          });
        return newUser;
    });

    await createSession(user.id, user.role, user.companyId);

    return { success: true };
  } catch (error) {
    console.error(error)
    if (error instanceof Error && error.message.includes("could not be found or created")) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}
