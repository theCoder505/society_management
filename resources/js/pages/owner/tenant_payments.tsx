import { SearchableTable } from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, CheckCircle2, Clock, X, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenant Payments',
        href: '/owner/tenant-payments',
    },
];

interface Tenant {
    tenant_uid: string;
    name: string;
    contact: string;
}

interface Bill {
    id: number;
    transaction_id: string;
    tenant_uid: string;
    amount: string;
    status: 'pending' | 'accepted' | 'denied';
    billing_month: string;
    payment_method: string;
    bill_type: string;
    is_admin_modified: boolean;
    note: string | null;
    created_at: string;
}

interface TenantPaymentsProps {
    bills: Bill[];
    tenants: Tenant[];
}

const billTypes: Record<string, string> = {
    monthly: 'Monthly Rent',
    electricity: 'Electricity Bill',
    water: 'Water Bill',
    gas: 'Gas Bill',
    wifi: 'WiFi Bill',
    dish: 'Cable Dish Bill',
    garage: 'Garage Cost',
    utility: 'Utility Service Charge',
    other: 'Other Cost',
};

const payMethods: Record<string, string> = {
    cash: 'Cash Payment',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque Payment',
    bkash: 'bKash Mobile',
    nagad: 'Nagad Mobile',
    rocket: 'Rocket Mobile',
    card: 'Credit/Debit Card',
    other: 'Other Method',
};

export default function TenantPayments({ bills, tenants }: TenantPaymentsProps) {
    // Map tenant_uid to Name for quick lookups
    const tenantNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        tenants.forEach((t) => {
            map[t.tenant_uid] = t.name;
        });
        return map;
    }, [tenants]);

    const handleVerify = (id: number, status: 'accepted' | 'denied') => {
        router.post(
            '/owner/tenant-payments/verify',
            { id, status },
            {
                preserveScroll: true,
            },
        );
    };

    // Columns config for SearchableTable
    const columns = [
        {
            header: 'Tenant Name',
            accessor: (row: Bill) => (
                <div>
                    <p className="text-foreground font-semibold">{tenantNameMap[row.tenant_uid] || 'Unknown Tenant'}</p>
                    <p className="text-muted-foreground font-mono text-[10px]">{row.tenant_uid}</p>
                </div>
            ),
        },
        {
            header: 'Transaction ID',
            accessor: (row: Bill) => (
                <div>
                    <p className="text-foreground font-mono text-sm font-semibold">{row.transaction_id}</p>
                    {row.is_admin_modified && (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-950/20 dark:text-amber-400">
                            Admin Modified
                        </span>
                    )}
                </div>
            ),
            sortable: true,
            sortKey: 'transaction_id' as keyof Bill,
        },
        {
            header: 'Bill Month',
            accessor: (row: Bill) => {
                const date = new Date(row.billing_month + '-01');
                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            },
            sortable: true,
            sortKey: 'billing_month' as keyof Bill,
        },
        {
            header: 'Bill Type',
            accessor: (row: Bill) => <span className="text-sm">{billTypes[row.bill_type] || row.bill_type}</span>,
        },
        {
            header: 'Method',
            accessor: (row: Bill) => <span className="text-xs">{payMethods[row.payment_method] || row.payment_method}</span>,
        },
        {
            header: 'Amount',
            accessor: (row: Bill) => (
                <span className="text-foreground font-semibold">৳{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            ),
            sortable: true,
            sortKey: 'amount' as keyof Bill,
        },
        {
            header: 'Status',
            accessor: (row: Bill) => {
                const colors = {
                    accepted: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-900',
                    denied: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900',
                    pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
                };
                const icons = {
                    accepted: <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-green-500" />,
                    denied: <XCircle className="mr-1 h-3.5 w-3.5 text-red-500" />,
                    pending: <Clock className="mr-1 h-3.5 w-3.5 text-amber-500" />,
                };
                return (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[row.status]}`}>
                        {icons[row.status]}
                        <span className="capitalize">{row.status}</span>
                    </span>
                );
            },
        },
        {
            header: 'Actions',
            className: 'max-w-[150px] w-[150px] text-end',
            accessor: (row: Bill) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(row.id, 'accepted')}
                        className="h-8 border-green-200 bg-green-50/50 px-2 text-xs text-green-700 hover:bg-green-100/50 dark:border-green-900 dark:bg-green-950/20 dark:text-green-400"
                    >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Accept
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(row.id, 'denied')}
                        className="h-8 border-red-200 bg-red-50/50 px-2 text-xs text-red-700 hover:bg-red-100/50 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400"
                    >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Deny
                    </Button>
                </div>
            ),
        },
    ];

    // Format billing list for indexing
    const formattedBills = useMemo(() => {
        return bills.map((b) => ({
            ...b,
            tenant_name: tenantNameMap[b.tenant_uid] || '',
        }));
    }, [bills, tenantNameMap]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verify Payments" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                {/* Header */}
                <div>
                    <h1 className="text-foreground text-2xl font-bold tracking-tight">Tenant Billing Verification</h1>
                    <p className="text-muted-foreground text-sm">Review transaction logs uploaded by your renting tenants</p>
                </div>

                {/* Searchable Table */}
                <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                    <SearchableTable
                        data={formattedBills}
                        columns={columns}
                        searchKeys={['transaction_id', 'tenant_name', 'tenant_uid', 'amount']}
                        searchPlaceholder="Search billing records..."
                        rowsPerPage={10}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
