
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'general'], {
    required_error: 'Please select a category.',
  }),
  message: z
    .string()
    .min(10, { message: 'Feedback must be at least 10 characters long.' })
    .max(1000, { message: 'Feedback must be less than 1000 characters.' }),
});

export default function FeedbackPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof feedbackSchema>) {
    console.log('Feedback Submitted:', values);
    toast({
      title: 'Feedback Received!',
      description: "Thank you for helping us improve Nourish Connect.",
    });
    form.reset();
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Submit Feedback
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
            Have an idea or found a bug? We would love to hear from you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Feedback</CardTitle>
            <CardDescription>
              Let us know how we can make the app better.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="general">General Comment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Submit Feedback
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
