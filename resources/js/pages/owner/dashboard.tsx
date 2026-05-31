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
    Building2,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Owner Dashboard',
        href: '/owner/dashboard',
    },
];

interface Flat {
    id: number;
    flatID: string;
    flat_size: string;
    flat_type: string;
    tenant_uid: string | null;
}

interface Announcement {
    id: number;
    title: string;
    announcement_details: string;
    created_at: string;
}

interface ServiceRequest {
    id: number;
    service_uid: string;
    title: string;
    requet_details: string;
    approve_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface FlatOwner {
    name: string;
    owner_uid: string;
    email: string;
    profile_status: string;
}

interface DashboardProps {
    owner: FlatOwner;
    flats: Flat[];
    totalFlats: number;
    totalTenants: number;
    totalIncome: number;
    pendingApprovals: number;
    announcements: Announcement[];
    tenantRequests: ServiceRequest[];
}

export default function OwnerDashboard({
    owner,
    flats,
    totalFlats,
    totalTenants,
    totalIncome,
    pendingApprovals,
    announcements,
    tenantRequests,
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
            <Head title="Flat Owner Portal" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header Welcome */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                            Welcome Back, {owner.name}
                        </h1>
                        <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formattedDate} · <span className="font-semibold text-primary">Flat Owner Account ({owner.owner_uid})</span>
                        </p>
                    </div>
                    <Link
                        href="/owner/notices"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Megaphone className="mr-2 h-4.5 w-4.5" />
                        Create Tenant Notice
                    </Link>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Owned Flats</span>
                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/20 p-2 text-blue-600 dark:text-blue-400">
                                <Building2 className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-foreground text-3xl font-extrabold">{totalFlats}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {flats.slice(0, 3).map((flat) => (
                                    <Link
                                        key={flat.id}
                                        href="/owner/my-flats"
                                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 transition-colors dark:bg-blue-950/30 dark:text-blue-400"
                                    >
                                        {flat.flatID}
                                    </Link>
                                ))}
                                {flats.length > 3 && (
                                    <Link href="/owner/my-flats" className="text-xs text-primary hover:underline">
                                        +{flats.length - 3} more
                                    </Link>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">Click a flat ID to view details</p>
                        </div>
                    </div>


                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Active Tenants</span>
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-2 text-emerald-600 dark:text-emerald-400">
                                <Users className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-foreground text-3xl font-extrabold">{totalTenants}</p>
                            <p className="text-muted-foreground mt-1 text-xs">Tenants currently renting</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Monthly Collections</span>
                            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/20 p-2 text-indigo-600 dark:text-indigo-400">
                                <DollarSign className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-foreground text-3xl font-extrabold">
                                ৳{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">Total rent payments approved</p>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Pending Verifications</span>
                            <span className="rounded-full bg-amber-50 dark:bg-amber-950/20 p-2 text-amber-600 dark:text-amber-400">
                                <Clock className="h-4 w-4 animate-pulse" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-foreground text-3xl font-extrabold">{pendingApprovals}</p>
                            <p className="text-muted-foreground mt-1 text-xs">Receipt uploads awaiting verification</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Bottom Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Tenant Service Requests */}
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground text-lg font-bold">Tenant Service Requests</h3>
                                <p className="text-muted-foreground text-xs">Maintenance tickets sent to you by renting tenants</p>
                            </div>
                            <Link href="/owner/service-requests" className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline">
                                View all <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {tenantRequests.length > 0 ? (
                                tenantRequests.map((req) => (
                                    <div key={req.id} className="border-border/50 hover:bg-muted/40 flex flex-col gap-2 rounded-lg border p-4 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-amber-500" />
                                                {req.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{req.requet_details}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground py-8 text-center text-sm">No pending tenant requests.</div>
                            )}
                        </div>
                    </div>

                    {/* Official Announcements */}
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground text-lg font-bold">Official Announcements</h3>
                                <p className="text-muted-foreground text-xs">Broad communications posted by the society lead</p>
                            </div>
                            <Link href="/owner/notices" className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline">
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
                                <div className="text-muted-foreground py-8 text-center text-sm">No announcements to display.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
