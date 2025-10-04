'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { login, signup } from '@/app/api/auth/actions';
import { useToast } from '@/hooks/use-toast';
import currencies from '@/data/currencies.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signupSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  country: z.string().min(2, { message: 'Please select a country.' }),
  currency: z.string().min(3, { message: 'Please select a currency.' }),
  name: z.string().min(2, { message: 'Your name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isSignup = mode === 'signup';
  const formSchema = isSignup ? signupSchema : loginSchema;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isSignup 
      ? { name: '', email: '', password: '', companyName: '', country: '', currency: '' } 
      : { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isSignup ? await signup(values as z.infer<typeof signupSchema>) : await login(values as z.infer<typeof loginSchema>);
      if (result.success) {
        toast({
          title: isSignup ? 'Account created' : 'Logged in',
          description: isSignup ? 'Welcome to ExpenseWise!' : 'Redirecting you to the dashboard...',
        });
        // Use window.location.href for a more reliable redirect
        window.location.href = '/dashboard';
      } else {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: result.error,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{isSignup ? 'Create Your Company Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isSignup ? 'Fill in the details to get started.' : 'Enter your credentials to access your dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignup && (
            <>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Inc." {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. United States" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@company.com" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} disabled={isPending}/>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Processing...' : (isSignup ? 'Create Account' : 'Log In')}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Sign up'}</Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Form>
  );
}
