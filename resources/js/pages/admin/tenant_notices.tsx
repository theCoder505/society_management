import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FlashMessage from '../FlashMessage';
import { Input } from '@headlessui/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notices',
        href: '/admin/tenant-notices',
    },
];


export default function TenantNotices() {
    const [search, setSearch] = useState('');


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{breadcrumbs[0].title}</h1>
                        <p className="text-muted-foreground text-sm">All Notices For All The Tenants</p>
                    </div>
                </div>

                <div className="relative max-w-sm border p-1 rounded-sm flex items-center text-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search here..."
                        className="pl-6 w-full outline-none"
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
