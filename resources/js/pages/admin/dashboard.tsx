import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    Building,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    TrendingDown,
    TrendingUp,
    UserPlus,
    Users,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface Bill {
    id: number;
    transaction_id: string;
    tenant_uid: string;
    tenant_name: string;
    amount: string;
    status: 'pending' | 'accepted' | 'denied';
    bill_type: string;
    payment_method: string;
    created_at: string;
}

interface SocietyCost {
    id: number;
    cost_uid: string;
    cost_type: string;
    amount: string;
    payment_method: string;
    cost_details: string | null;
    created_at: string;
}

interface DashboardStats {
    total_apartments: number;
    total_flats: number;
    total_tenants: number;
    total_owners: number;
    total_pending_bills: number;
    monthly_collections: number;
    monthly_expenditure: number;
}

interface Props {
    stats: DashboardStats;
    recentBills: Bill[];
    recentSocietyCosts: SocietyCost[];
}

export default function Dashboard({ stats, recentBills, recentSocietyCosts }: Props) {
    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }, []);

    // Occupancy Rate calculation
    const occupancyRate = useMemo(() => {
        if (!stats.total_flats) return 0;
        return Math.round((stats.total_tenants / stats.total_flats) * 100);
    }, [stats.total_flats, stats.total_tenants]);

    const statsCards = [
        {
            title: 'Apartments',
            value: stats.total_apartments,
            description: 'Total residential towers',
            icon: Building,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
            link: '/admin/apartments',
        },
        {
            title: 'Total Flats',
            value: stats.total_flats,
            description: `${occupancyRate}% occupancy rate (${stats.total_tenants} rented)`,
            icon: Building2,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400',
            link: '/admin/flats',
        },
        {
            title: 'Flat Owners',
            value: stats.total_owners,
            description: 'Registered asset owners',
            icon: Users,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400',
            link: '/admin/flat-owners',
        },
        {
            title: 'Active Tenants',
            value: stats.total_tenants,
            description: 'Verified family heads',
            icon: UserPlus,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
            link: '/admin/tenants',
        },
    ];

    const billTypes: Record<string, string> = {
        monthly: 'Rent',
        electricity: 'Electricity',
        water: 'Water',
        gas: 'Gas',
        wifi: 'WiFi',
        dish: 'Dish',
        garage: 'Garage',
        utility: 'Utility',
        other: 'Other',
    };

    const costTypes: Record<string, string> = {
        guard_fee: 'Guard Salary',
        development_fee: 'Project cost',
        lift_fee: 'Lift Maintenance',
        monthly_fee: 'General Fee',
        new_installation: 'Installation',
        other: 'Misc Cost',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Welcome Banner */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Welcome Back, Society Lead</h1>
                        <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
                            <Calendar className="h-4 w-4" />
                            Today is {formattedDate}
                        </p>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                href={card.link}
                                key={idx}
                                className="group bg-card relative overflow-hidden rounded-xl border p-6 shadow-xs transition-all duration-300 hover:shadow-md dark:border-neutral-800"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">{card.title}</span>
                                    <div className={`rounded-lg p-2 ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h2 className="text-foreground text-3xl font-bold tracking-tight">{card.value}</h2>
                                    <p className="text-muted-foreground mt-1 text-xs">{card.description}</p>
                                </div>
                                <div className="absolute right-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <ArrowUpRight className="text-muted-foreground h-4 w-4" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Financial overview row */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Collections Card */}
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Monthly Collections</span>
                            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <TrendingUp className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="my-4">
                            <p className="text-foreground text-3xl font-extrabold">
                                ৳{stats.monthly_collections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">Total revenue collected this month</p>
                        </div>
                        <Link href="/admin/tenant-bills" className="text-primary mt-2 flex items-center gap-1 text-xs font-semibold hover:underline">
                            View all bill receipts <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Expenditures Card */}
                    <div className="bg-card flex flex-col justify-between rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Monthly Expenditure</span>
                            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                <TrendingDown className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="my-4">
                            <p className="text-foreground text-3xl font-extrabold">
                                ৳{stats.monthly_expenditure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">Total society cost disbursement</p>
                        </div>
                        <Link
                            href="/admin/society-expenditure"
                            className="text-primary mt-2 flex items-center gap-1 text-xs font-semibold hover:underline"
                        >
                            View expenditure statements <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Pending Approvals Alert Card */}
                    <div
                        className={`flex flex-col justify-between rounded-xl border p-6 shadow-xs dark:border-neutral-800 ${
                            stats.total_pending_bills > 0
                                ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/10'
                                : 'bg-card border-border'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Pending Approvals</span>
                            <span
                                className={`rounded-full p-2 ${
                                    stats.total_pending_bills > 0
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                        : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-neutral-500'
                                }`}
                            >
                                {stats.total_pending_bills > 0 ? <AlertCircle className="h-4 w-4 animate-pulse" /> : <Clock className="h-4 w-4" />}
                            </span>
                        </div>
                        <div className="my-4">
                            <p className="text-foreground text-3xl font-extrabold">{stats.total_pending_bills}</p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {stats.total_pending_bills > 0
                                    ? 'Tenant billing submissions require verification'
                                    : 'All tenant payments are up to date!'}
                            </p>
                        </div>
                        <Link href="/admin/tenant-bills" className="text-primary mt-2 flex items-center gap-1 text-xs font-semibold hover:underline">
                            Verify payments <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>

                {/* Recent Activities Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Tenant Bills */}
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground text-lg font-bold">Recent Tenant Payments</h3>
                                <p className="text-muted-foreground text-xs">Latest transaction uploads by building tenants</p>
                            </div>
                            <Link href="/admin/tenant-bills" className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline">
                                View all <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentBills.length > 0 ? (
                                recentBills.map((bill) => (
                                    <div
                                        key={bill.id}
                                        className="border-border/50 hover:bg-muted/40 flex items-center justify-between rounded-lg border p-3 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`rounded-full p-2 ${
                                                    bill.status === 'accepted'
                                                        ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                                                        : bill.status === 'denied'
                                                          ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                                                          : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400'
                                                }`}
                                            >
                                                {bill.status === 'accepted' ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : bill.status === 'denied' ? (
                                                    <XCircle className="h-4 w-4" />
                                                ) : (
                                                    <Clock className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-foreground text-sm font-semibold">{bill.tenant_name}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    {billTypes[bill.bill_type] || bill.bill_type} ·{' '}
                                                    <span className="font-mono text-[10px]">{bill.transaction_id}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-foreground text-sm font-bold">
                                                ৳{parseFloat(bill.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-muted-foreground mt-0.5 text-[10px]">
                                                {new Date(bill.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground py-8 text-center text-sm">No tenant bill uploads found.</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Society Expenditure */}
                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground text-lg font-bold">Recent Expenditure</h3>
                                <p className="text-muted-foreground text-xs">Latest financial disbursements issued by the committee</p>
                            </div>
                            <Link
                                href="/admin/society-expenditure"
                                className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline"
                            >
                                View all <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentSocietyCosts.length > 0 ? (
                                recentSocietyCosts.map((cost) => (
                                    <div
                                        key={cost.id}
                                        className="border-border/50 hover:bg-muted/40 flex items-center justify-between rounded-lg border p-3 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-foreground text-sm font-semibold">{costTypes[cost.cost_type] || cost.cost_type}</p>
                                                <p className="text-muted-foreground max-w-[200px] truncate text-xs">
                                                    {cost.cost_details || 'Utility payout'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-foreground text-sm font-bold">
                                                -৳{parseFloat(cost.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-muted-foreground mt-0.5 text-[10px]">
                                                {new Date(cost.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground py-8 text-center text-sm">No society costs recorded.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
