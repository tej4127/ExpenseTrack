import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import type { User } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { DashboardHeader } from '@/components/dashboard-header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      createdAt: true,
      isManagerApprover: true,
      managerId: true
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <DashboardNav user={user} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
