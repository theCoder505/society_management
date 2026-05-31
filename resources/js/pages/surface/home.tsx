import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FlashMessage from '../FlashMessage';
import ThemeToggle from '@/components/surface/ThemeToggle';
import '../../../css/surface.css';
import ApartmentCard from '@/components/surface/ApartmentCard';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Home', href: '/' }];

// Mock apartment data
const apartments = [
  {
    id: 1,
    title: 'Luxury 2BHK Apartment',
    description: 'Spacious 2 bedroom unit with city view.',
    rent: '$1200/mo',
    image: '/images/apartment1.jpg',
  },
  {
    id: 2,
    title: 'Cozy Studio',
    description: 'Perfect for singles, close to public transport.',
    rent: '$800/mo',
    image: '/images/apartment2.jpg',
  },
  {
    id: 3,
    title: 'Family 3BHK',
    description: 'Ideal for families, includes parking space.',
    rent: '$1500/mo',
    image: '/images/apartment3.jpg',
  },
];

export default function SurfaceHome() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Society Management – Home" />
      <ThemeToggle />
      <div className="surface-hero flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-8 bg-gradient-to-br from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:to-primary/10">
        <FlashMessage />
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-foreground mb-6 drop-shadow-lg">
          Premium Society Management Portal
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-center mb-8">
          Streamlined multi‑role portals for admins, flat owners, and tenants. Manage payments, notices, service requests, and more with a modern, glass‑morphic UI.
        </p>
        <Link href="/tenant/dashboard" className="btn-primary gap-2 flex items-center">
          <span className="icon-plus">+</span>
          Explore Tenant Portal
        </Link>
      </div>
      <section className="surface-apartments py-12 px-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Featured Apartments</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apt) => (
            <ApartmentCard key={apt.id} apartment={apt} />
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
