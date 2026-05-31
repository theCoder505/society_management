import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React, { useMemo } from 'react';
import {
    Activity,
    CreditCard,
    DollarSign,
    FileText,
    Megaphone,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    Calendar,
    ArrowUpRight,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenant Dashboard',
        href: '/tenant/dashboard',
    },
];

interface Flat {
    id: number;
    flatID: string;
    rent_price: string;
    flat_size: string;
    flat_type: string;
}

interface Announcement {
    id: number;
    title: string;
    announcement_details: string;
    created_at: string;
}

interface Notice {
    id: number;
    notice_uid: string;
    title: string;
    notice_details: string;
    is_complied: boolean;
    created_at: string;
}

interface Tenant {
    name: string;
    tenant_uid: string;
    email: string;
    contact: string;
    profile_status: string;
}

interface DashboardProps {
    tenant: Tenant;
    flats: Flat[];
    totalPaid: number;
    pendingBillsCount: number;
    announcements: Announcement[];
    notices: Notice[];
}

export default function TenantDashboard({
    tenant,
    flats,
    totalPaid,
    pendingBillsCount,
    announcements,
    notices,
}: DashboardProps) {
    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenant Portal" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header Welcome */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                            Welcome Back, {tenant.name}
                        </h1>
                        <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formattedDate} · <span className="font-semibold text-primary">Tenant Account ({tenant.tenant_uid})</span>
                        </p>
                    </div>
                    <Link
                        href="/tenant/payments"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
                    >
                        <CreditCard className="mr-2 h-4.5 w-4.5" />
                        Pay Rent & Utilities
                    </Link>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Total Rent & Utilities Paid</span>
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-foreground text-3xl font-extrabold">
                                ৳{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">All approved payments</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Pending Verifications</span>
                            <span className="rounded-full bg-amber-50 dark:bg-amber-950/20 p-2 text-amber-600 dark:text-amber-400">
                                <Clock className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-foreground text-3xl font-extrabold">{pendingBillsCount}</p>
                            <p className="text-muted-foreground mt-1 text-xs">Awaiting landlord confirmation</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Rented Flats</span>
                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/20 p-2 text-blue-600 dark:text-blue-400">
                                <User className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="flex flex-wrap gap-1.5">
                                {flats.length > 0 ? (
                                    flats.map((flat) => (
                                        <Link
                                            key={flat.id}
                                            href="/tenant/my-flats"
                                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 transition-colors dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
                                        >
                                            {flat.flatID} ({flat.flat_size} sqft)
                                        </Link>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-xs italic">No flats assigned</span>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-2 text-xs">Total rented properties</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Bottom Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Notices / Personal Alerts */}
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground text-lg font-bold">Personal Notices</h3>
                                <p className="text-muted-foreground text-xs">Direct messages and requests from your landlord or admin</p>
                            </div>
                            <Link href="/tenant/notices" className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline">
                                View all <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {notices.length > 0 ? (
                                notices.map((notice) => (
                                    <div key={notice.id} className="border-border/50 hover:bg-muted/40 flex flex-col gap-2 rounded-lg border p-4 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                {notice.is_complied ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                )}
                                                {notice.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(notice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{notice.notice_details}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground py-8 text-center text-sm">No personal notices.</div>
                            )}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground text-lg font-bold">Society Announcements</h3>
                                <p className="text-muted-foreground text-xs">Official news broadcasts from the society management committee</p>
                            </div>
                            <Link href="/tenant/notices" className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline">
                                View all <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {announcements.length > 0 ? (
                                announcements.map((ann) => (
                                    <div key={ann.id} className="border-border/50 hover:bg-muted/40 flex gap-3 rounded-lg border p-4 transition-colors">
                                        <div className="rounded-full bg-primary/10 text-primary p-2 h-fit">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-foreground">{ann.title}</p>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(ann.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{ann.announcement_details}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground py-8 text-center text-sm">No society announcements.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
