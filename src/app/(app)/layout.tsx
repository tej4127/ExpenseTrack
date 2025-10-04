import type { User } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardNav } from '@/components/dashboard-nav';
import { DashboardHeader } from '@/components/dashboard-header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dummy user object to bypass authentication
  const user: User = {
    id: 'dummy-admin-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    companyId: 'dummy-company-id',
    createdAt: new Date(),
    isManagerApprover: true,
    managerId: null,
  };

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
