
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
import { format, formatDistanceToNow, subDays } from 'date-fns';

function getDummyDashboardData(role: string) {
  const commonRecentExpenses = [
    { id: '1', category: 'Travel', user: { name: 'John Doe' }, amountInCompanyCurrency: 150.75, status: 'APPROVED', date: subDays(new Date(), 2) },
    { id: '2', category: 'Meals & Entertainment', user: { name: 'Jane Smith' }, amountInCompanyCurrency: 88.20, status: 'PENDING', date: subDays(new Date(), 1) },
    { id: '3', category: 'Software', user: { name: 'Peter Jones' }, amountInCompanyCurrency: 49.99, status: 'APPROVED', date: subDays(new Date(), 5) },
    { id: '4', category: 'Office Supplies', user: { name: 'Mary Johnson' }, amountInCompanyCurrency: 25.00, status: 'REJECTED', date: subDays(new Date(), 10) },
    { id: '5', category: 'Travel', user: { name: 'John Doe' }, amountInCompanyCurrency: 450.00, status: 'PENDING', date: subDays(new Date(), 3) },
  ];

  if (role === 'ADMIN') {
    return { 
      totalExpenses: 12560.50, 
      approvedExpenses: 82, 
      pendingExpenses: 15, 
      userCount: 25, 
      recentExpenses: commonRecentExpenses 
    };
  } else if (role === 'MANAGER') {
    return { 
      totalTeamExpenses: 4580.30, 
      pendingApprovals: 5, 
      recentExpenses: commonRecentExpenses.filter(e => ['Jane Smith', 'Peter Jones'].includes(e.user.name))
    };
  }
  // Employee
  return { 
    totalExpenses: 875.50, 
    approvedExpenses: 8, 
    pendingExpenses: 2, 
    recentExpenses: commonRecentExpenses.filter(e => e.user.name === 'John Doe')
  };
}

export default async function DashboardPage() {
  // Dummy session data to bypass authentication
  const session = {
    role: 'ADMIN',
  };
  const companyCurrency = 'USD';

  const data = getDummyDashboardData(session.role);

  const formatCurrency = (amount: number | null | undefined) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: companyCurrency }).format(amount || 0);
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
      {renderRecentExpensesTable(data.recentExpenses)}
    </>
  );

  const renderManagerDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
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
      {renderRecentExpensesTable(data.recentExpenses)}
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
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.approvedExpenses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingExpenses}</div>
          </CardContent>
        </Card>
      </div>
      {renderRecentExpensesTable(data.recentExpenses)}
    </>
  );

  const renderRecentExpensesTable = (expenses: any[]) => (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.user.name}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{format(expense.date, 'PPP')}</span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(expense.date, { addSuffix: true })}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    expense.status === 'APPROVED' ? 'default' : expense.status === 'PENDING' ? 'secondary' : 'destructive'
                  } className={cn(
                    expense.status === 'APPROVED' && 'bg-accent text-accent-foreground',
                  )}>
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(expense.amountInCompanyCurrency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => {
    switch(session.role) {
      case 'ADMIN':
        return renderAdminDashboard();
      case 'MANAGER':
        return renderManagerDashboard();
      case 'EMPLOYEE':
        return renderEmployeeDashboard();
      default:
        return <p>No dashboard available for your role.</p>;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      </div>
      {renderDashboard()}
    </div>
  )
}
