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
    console.log('1. Finding user with email:', values.email);
    const user = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (!user || !user.passwordHash) {
      console.error('Login failed: User not found or password not set for', values.email);
      return { success: false, error: 'Invalid email or password.' };
    }
    console.log('2. User found. Verifying password...');

    const passwordMatch = await verifyPassword(values.password, user.passwordHash);

    if (!passwordMatch) {
      console.error('Login failed: Password mismatch for', values.email);
      return { success: false, error: 'Invalid email or password.' };
    }
    console.log('3. Password verified. Creating session...');

    await createSession(user.id, user.role, user.companyId);
    console.log('4. Session created successfully.');
    console.log('--- LOGIN ACTION SUCCESS ---');

    return { success: true };
  } catch (error) {
    console.error('--- LOGIN ACTION FAILED ---');
    console.error('An unexpected error occurred during login:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  console.log('--- SIGNUP ACTION START ---');
  try {
    const { companyName, country, currency, name, email, password } = values;
    console.log('1. Received signup data for email:', email);

    console.log('2. Checking for existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('Signup failed: User with this email already exists:', email);
      return { success: false, error: 'A user with this email already exists.' };
    }
    console.log('3. User does not exist. Hashing password...');

    const passwordHash = await hashPassword(password);
    console.log('4. Password hashed. Checking company count...');
    
    const companyCount = await prisma.company.count();
    console.log(`5. Found ${companyCount} existing companies.`);

    if (companyCount === 0) {
      console.log('6a. No companies exist. Creating new company and ADMIN user in a transaction...');
      const user = await prisma.$transaction(async (tx) => {
        console.log(' -> Transaction: Creating company:', companyName);
        const newCompany = await tx.company.create({
          data: {
            name: companyName,
            country: country,
            currency: currency,
          },
        });
        console.log(' -> Transaction: Company created with ID:', newCompany.id);

        console.log(' -> Transaction: Creating user:', name);
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: 'ADMIN',
            companyId: newCompany.id,
          },
        });
        console.log(' -> Transaction: User created with ID:', newUser.id);
        return newUser;
      });

      console.log('7a. Transaction successful. Creating session...');
      await createSession(user.id, user.role, user.companyId);
      console.log('8a. Session created.');
      console.log('--- SIGNUP ACTION SUCCESS (ADMIN) ---');
      return { success: true };

    } else {
      console.log('6b. Company exists. Joining as EMPLOYEE...');
      const company = await prisma.company.findFirst();
      if (!company) {
        console.error('CRITICAL: companyCount > 0 but no company found.');
        return { success: false, error: 'Could not find a company to join.' };
      }
      console.log('7b. Found company to join:', company.name);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'EMPLOYEE',
          companyId: company.id,
        },
      });
      console.log('8b. User created with ID:', user.id);

      console.log('9b. Creating session...');
      await createSession(user.id, user.role, user.companyId);
      console.log('10b. Session created.');
      console.log('--- SIGNUP ACTION SUCCESS (EMPLOYEE) ---');
      return { success: true };
    }

  } catch (error) {
    console.error('--- SIGNUP ACTION FAILED ---');
    console.error('An unexpected error occurred during signup:', error);
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}
