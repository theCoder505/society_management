// resources/js/pages/surface/contact.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import FlashMessage from '../FlashMessage';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Contact', href: '/contact' },
];

export default function SurfaceContact() {
  const contactForm = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactForm.post('/contact', {
      onSuccess: () => {
        contactForm.reset();
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Contact Us" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-8 bg-gradient-to-br from-background via-primary/5 to-background/10 dark:from-background/20 dark:to-background/10">
        <FlashMessage />
        <h1 className="text-3xl font-bold text-foreground mb-6">Get In Touch</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              required
              value={contactForm.data.name}
              onChange={e => contactForm.setData('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={contactForm.data.email}
              onChange={e => contactForm.setData('email', e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              required
              value={contactForm.data.subject}
              onChange={e => contactForm.setData('subject', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
              required
              value={contactForm.data.message}
              onChange={e => contactForm.setData('message', e.target.value)}
              placeholder="Tell us how we can help..."
              className="resize-none"
            />
          </div>
          <Button type="submit" disabled={contactForm.processing} className="w-full">
            {contactForm.processing && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
            Send Message
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
