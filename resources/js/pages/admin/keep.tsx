import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button, Input } from '@headlessui/react';
import { Head } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Flats',
        href: '/admin/flats',
    },
];

export default function Dashboard() {
    const [search, setSearch] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{breadcrumbs[0].title}</h1>
                        <p className="text-muted-foreground text-sm">Manage all flats belongs to the apartments</p>
                    </div>
                    <Button className="">
                        <Plus className="mr-2 h-4 w-4" />
                        New Flat
                    </Button>
                </div>

                <div className="relative flex max-w-sm items-center rounded-sm border p-1 text-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search by name, location, UID…"
                        className="w-full pl-6 outline-none"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
