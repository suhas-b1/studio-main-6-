
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { HandHeart, Mail, Send, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsSent(true);
    } catch (error: any) {
      console.error(error);
      let description = 'An unknown error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        description = 'This email address is not associated with an account.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Failed to send link',
        description,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <HandHeart className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold font-headline tracking-tight text-foreground">
            {isSent ? 'Check Your Inbox' : 'Forgot Your Password?'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isSent 
              ? `We've sent a password reset link to ${form.getValues('email')}.`
              : "No problem. Enter your email address and we'll send you a link to reset it."}
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          {isSent ? (
            <div className="text-center">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ChevronLeft className="mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                  <Send className="ml-2" />
                </Button>
              </form>
            </Form>
          )}
        </div>
        
        {!isSent && (
            <p className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        )}
      </div>
    </div>
  );
}
