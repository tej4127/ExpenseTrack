import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CheckCircle, Clock, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';

async function getDashboardData(userId: string, companyId: string, role: string) {
  if (role === 'ADMIN') {
    const [totalExpenses, approvedExpenses, pendingExpenses, userCount, recentExpenses] = await Promise.all([
      prisma.expense.aggregate({ where: { companyId }, _sum: { amountInCompanyCurrency: true } }),
      prisma.expense.count({ where: { companyId, status: 'APPROVED' } }),
      prisma.expense.count({ where: { companyId, status: 'PENDING' } }),
      prisma.user.count({ where: { companyId } }),
      prisma.expense.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
    ]);
    return { totalExpenses: totalExpenses._sum.amountInCompanyCurrency, approvedExpenses, pendingExpenses, userCount, recentExpenses };
  } else if (role === 'MANAGER') {
    const [teamMemberIds, pendingApprovals] = await Promise.all([
        prisma.user.findMany({ where: { managerId: userId }, select: { id: true } }).then(users => users.map(u => u.id)),
        prisma.expense.count({ where: { user: { managerId: userId }, status: 'PENDING' } })
    ]);
    const [totalTeamExpenses, recentTeamExpenses] = await Promise.all([
        prisma.expense.aggregate({ where: { userId: { in: teamMemberIds } }, _sum: { amountInCompanyCurrency: true } }),
        prisma.expense.findMany({ where: { userId: { in: teamMemberIds } }, orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { name: true } } } }),
    ]);
    return { totalTeamExpenses: totalTeamExpenses._sum.amountInCompanyCurrency, pendingApprovals, recentExpenses: recentTeamExpenses };
  }
  // Employee
  const [totalExpenses, approvedExpenses, pendingExpenses, recentExpenses] = await Promise.all([
    prisma.expense.aggregate({ where: { userId }, _sum: { amountInCompanyCurrency: true } }),
    prisma.expense.count({ where: { userId, status: 'APPROVED' } }),
    prisma.expense.count({ where: { userId, status: 'PENDING' } }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);
  return { totalExpenses: totalExpenses._sum.amountInCompanyCurrency, approvedExpenses, pendingExpenses, recentExpenses };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = await getDashboardData(session.userId, session.companyId, session.role);
  const company = await prisma.company.findUnique({ where: {id: session.companyId}});

  const formatCurrency = (amount: number | null | undefined) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: company?.currency || 'USD' }).format(amount || 0);
  }

  const renderAdminDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Expenses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.approvedExpenses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingExpenses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userCount}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );

    const renderManagerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalTeamExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingApprovals}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderEmployeeDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.approvedExpenses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingExpenses}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a summary of your expense activity.
        </p>
      </div>
      
      {session.role === 'ADMIN' && renderAdminDashboard()}
      {session.role === 'MANAGER' && renderManagerDashboard()}
      {session.role === 'EMPLOYEE' && renderEmployeeDashboard()}

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                {session.role !== 'EMPLOYEE' && <TableHead>Employee</TableHead>}
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentExpenses?.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.category}</TableCell>
                  {session.role !== 'EMPLOYEE' && <TableCell>{expense.user?.name}</TableCell>}
                  <TableCell>{formatCurrency(expense.amountInCompanyCurrency)}</TableCell>
                  <TableCell>
                    <Badge variant={expense.status === 'APPROVED' ? 'default' : expense.status === 'PENDING' ? 'secondary' : 'destructive'} className={expense.status === 'APPROVED' ? 'bg-accent text-accent-foreground' : ''}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell title={format(expense.date, 'PPP')}>{formatDistanceToNow(expense.date, { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
