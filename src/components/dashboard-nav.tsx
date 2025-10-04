'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  GitPullRequestArrow,
  Building,
  Users,
  Gavel,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

type DashboardNavProps = {
  user: User;
};

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      href: '/expenses',
      label: 'My Expenses',
      icon: Wallet,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      subItems: [{ href: '/expenses/new', label: 'New Expense' }],
    },
    {
      href: '/approvals',
      label: 'Team Approvals',
      icon: GitPullRequestArrow,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      href: '/admin',
      label: 'Administration',
      icon: Building,
      roles: ['ADMIN'],
      subItems: [
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/rules', label: 'Approval Rules' },
      ],
    },
  ];

  return (
    <Sidebar
      className="border-r"
      collapsible="icon"
      variant={state === 'collapsed' ? 'sidebar' : 'floating'}
    >
      <SidebarHeader className="h-16 justify-center p-4">
        <Logo className="h-8 w-8 text-primary" />
        <h1
          className={cn(
            'text-xl font-bold font-headline transition-opacity duration-200',
            state === 'collapsed' ? 'opacity-0' : 'opacity-100'
          )}
        >
          ExpenseWise
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems
            .filter(item => item.roles.includes(user.role))
            .map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/expenses' || pathname === '/expenses') && item.href !== '/admin'}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.subItems && (
                  <SidebarMenuSub>
                    {item.subItems.map(subItem => (
                      <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                          <Link href={subItem.href}>{subItem.label}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
