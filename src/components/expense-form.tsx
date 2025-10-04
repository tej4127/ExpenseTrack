'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import currencies from '@/data/currencies.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { placeholderImages } from '@/lib/placeholder-images';

const expenseSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  currency: z.string().min(3, { message: 'Currency is required.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  date: z.date({ required_error: 'Expense date is required.' }),
  description: z.string().optional(),
  vendor: z.string().min(2, { message: 'Vendor is required.' }),
  receipt: z.any().optional(),
});

export function ExpenseForm() {
  const [isPending, startTransition] = useTransition();
  const [isOcrLoading, setOcrLoading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: 'USD',
    },
  });
  
  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setReceiptPreview(dataUri);

      try {
        const response = await fetch('/api/ocr/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptDataUri: dataUri }),
        });
        const result = await response.json();

        if (result.amount) form.setValue('amount', parseFloat(result.amount.replace(/[^0-9.-]+/g,"")));
        if (result.vendor) form.setValue('vendor', result.vendor);
        if (result.date) {
            const parsedDate = new Date(result.date);
            if (!isNaN(parsedDate.getTime())) {
                form.setValue('date', parsedDate);
            }
        }
        toast({ title: "Receipt Scanned", description: "We've pre-filled some details for you." });
      } catch (error) {
        toast({ variant: 'destructive', title: 'OCR Failed', description: 'Could not parse receipt.' });
      } finally {
        setOcrLoading(false);
      }
    };
  };

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    startTransition(async () => {
        // Here you would call a server action to create the expense
      console.log(values);
      toast({ title: 'Expense Submitted', description: 'Your expense is now pending approval.' });
      router.push('/expenses');
    });
  }

  const receiptPlaceholder = placeholderImages.find(p => p.id === 'receipt-placeholder');

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold text-lg">Receipt</h3>
              <FormField
                control={form.control}
                name="receipt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                        <div className="relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                            {(isOcrLoading || receiptPreview) ? (
                                <>
                                    <Image src={receiptPreview || receiptPlaceholder!.imageUrl} alt="Receipt preview" fill className="object-contain rounded-lg p-2" />
                                    {isOcrLoading && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG or PDF (MAX. 5MB)</p>
                                </div>
                            )}
                             <Input id="dropzone-file" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleReceiptUpload} disabled={isPending || isOcrLoading} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor / Merchant</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Starbucks" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Expense</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              disabled={isPending}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isPending} />
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
                          {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="meals">Meals & Entertainment</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="software">Software & Subscriptions</SelectItem>
                            <SelectItem value="office">Office Supplies</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the expense..." {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Expense'}
                  </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
