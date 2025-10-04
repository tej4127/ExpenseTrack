import type { User as PrismaUser } from '@prisma/client';

export type User = Omit<PrismaUser, 'passwordHash'>;

export type SessionPayload = {
  userId: string;
  role: string;
  companyId: string;
};
