import { SearchableTable } from '@/components/SearchableTable';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenant Bills',
        href: '/admin/tenant-bills',
    },
];

interface TenantBill {
    id: number;
    transaction_id: string;
    tenant_uid: string;
    amount: string;
    status: 'pending' | 'accepted' | 'denied';
    billing_month: string;
    payment_method: string;
    bill_type: string;
    sent_money_to: string;
    note: string | null;
    is_admin_modified: boolean;
    created_at: string;
}

interface Tenant {
    tenant_uid: string;
    name: string;
    renting_flats: string | string[];
}

interface Props {
    bills: TenantBill[];
    tenants: Tenant[];
}

interface BillFormData {
    tenant_uid: string;
    amount: string;
    status: string;
    billing_month: string;
    payment_method: string;
    bill_type: string;
    sent_money_to: string;
    note: string;
    transaction_id: string;
    [key: string]: string | number | undefined;
}

const emptyForm = (): BillFormData => ({
    tenant_uid: '',
    amount: '',
    status: 'pending',
    billing_month: new Date().toISOString().substring(0, 7),
    payment_method: 'cash',
    bill_type: 'monthly',
    sent_money_to: 'flat_owner',
    note: '',
    transaction_id: '',
});

const sentMoneyToLabels: Record<string, string> = {
    flat_owner: 'Flat Owner',
    guard: 'Security Guard',
    society_lead: 'Society Lead',
    other: 'Other',
};

const paymentMethods: Record<string, string> = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    card: 'Card',
    other: 'Other',
};

const billTypes: Record<string, string> = {
    monthly: 'Rent (Monthly)',
    electricity: 'Electricity',
    water: 'Water',
    gas: 'Gas',
    wifi: 'WiFi',
    dish: 'Satellite Dish',
    garage: 'Garage Cost',
    utility: 'Utility',
    other: 'Other',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

// ─── Inline Status Select ────────────────────────────────────────────────────
function InlineStatusSelect({ bill }: { bill: TenantBill }) {
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === bill.status) return;
        setUpdating(true);
        router.put(
            route('costs.tenants.update'),
            {
                id: bill.id,
                tenant_uid: bill.tenant_uid,
                amount: bill.amount,
                status: newStatus,
                billing_month: bill.billing_month,
                payment_method: bill.payment_method,
                bill_type: bill.bill_type,
                sent_money_to: bill.sent_money_to,
                note: bill.note ?? '',
                transaction_id: bill.transaction_id,
            },
            {
                preserveScroll: true,
                onFinish: () => setUpdating(false),
            },
        );
    };

    return (
        <Select value={bill.status} onValueChange={handleStatusChange} disabled={updating}>
            <SelectTrigger
                className={`h-7 w-28 rounded-full border-0 px-2.5 text-xs font-semibold shadow-none focus:ring-1 ${statusColors[bill.status]} ${updating ? 'opacity-60' : ''}`}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pending">
                    <span className="text-yellow-700 dark:text-yellow-300">Pending</span>
                </SelectItem>
                <SelectItem value="accepted">
                    <span className="text-green-700 dark:text-green-300">Accepted</span>
                </SelectItem>
                <SelectItem value="denied">
                    <span className="text-red-700 dark:text-red-300">Denied</span>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}

export default function TenantBills({ bills, tenants }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBill, setSelectedBill] = useState<TenantBill | null>(null);

    const createForm = useForm<BillFormData>(emptyForm());

    const tenantNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        tenants.forEach((t) => {
            map[t.tenant_uid] = t.name;
        });
        return map;
    }, [tenants]);

    const handleCreate = () => {
        createForm.post(route('costs.tenants.create'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedBill) return;
        router.delete(route('costs.tenants.delete'), {
            data: { id: selectedBill.id },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedBill(null);
            },
        });
    };

    const columns = [
        {
            header: 'Transaction ID',
            accessor: (row: TenantBill) => (
                <div>
                    <span className="text-foreground font-mono text-xs font-semibold">{row.transaction_id}</span>
                    {row.is_admin_modified && (
                        <span className="ml-1.5 inline-block rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                            Admin Modified
                        </span>
                    )}
                </div>
            ),
            sortable: true,
            sortKey: 'transaction_id' as keyof TenantBill,
        },
        {
            header: 'Tenant',
            accessor: (row: TenantBill) => (
                <div>
                    <p className="text-foreground font-medium">{tenantNameMap[row.tenant_uid] || 'Unknown Tenant'}</p>
                    <p className="text-muted-foreground font-mono text-xs">{row.tenant_uid}</p>
                </div>
            ),
        },
        {
            header: 'Billing Month',
            accessor: (row: TenantBill) => {
                if (!row.billing_month) return <span className="text-muted-foreground italic">N/A</span>;
                const [year, month] = row.billing_month.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
            },
            sortable: true,
            sortKey: 'billing_month' as keyof TenantBill,
        },
        {
            header: 'Bill Type',
            accessor: (row: TenantBill) => (
                <span className="text-foreground text-sm font-medium">{billTypes[row.bill_type] || row.bill_type}</span>
            ),
        },
        {
            header: 'Amount',
            accessor: (row: TenantBill) => (
                <span className="text-foreground font-medium">
                    ৳{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
            ),
            sortable: true,
            sortKey: 'amount' as keyof TenantBill,
        },
        {
            header: 'Payment Mode',
            accessor: (row: TenantBill) => (
                <span className="text-foreground text-sm">{paymentMethods[row.payment_method] || row.payment_method}</span>
            ),
        },
        {
            header: 'Sent To',
            accessor: (row: TenantBill) => (
                <span className="text-foreground text-sm">{sentMoneyToLabels[row.sent_money_to] || row.sent_money_to}</span>
            ),
        },
        {
            header: 'Notes',
            accessor: (row: TenantBill) =>
                row.note ? (
                    <span className="text-foreground max-w-[160px] truncate text-sm" title={row.note}>
                        {row.note}
                    </span>
                ) : (
                    <span className="text-muted-foreground italic text-xs">—</span>
                ),
        },
        {
            header: 'Status',
            accessor: (row: TenantBill) => <InlineStatusSelect bill={row} />,
            sortable: true,
            sortKey: 'status' as keyof TenantBill,
        },
        {
            header: 'Actions',
            className: 'max-w-[50px] text-right',
            accessor: (row: TenantBill) => (
                <div className="flex items-center justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive max-w-[50px]"
                        onClick={() => {
                            setSelectedBill(row);
                            setShowDeleteDialog(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const tableData = useMemo(() => {
        return bills.map((bill) => ({
            ...bill,
            tenant_name: tenantNameMap[bill.tenant_uid] || '',
            bill_type_label: billTypes[bill.bill_type] || '',
            payment_method_label: paymentMethods[bill.payment_method] || '',
        }));
    }, [bills, tenantNameMap]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tenant Bills & Payments</h1>
                        <p className="text-muted-foreground text-sm">
                            Review, approve, and record payments for rent, electricity, utilities, and garage fees
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Record Payment
                    </Button>
                </div>

                <div className="mt-4">
                    <SearchableTable
                        data={tableData}
                        columns={columns}
                        searchKeys={['transaction_id', 'tenant_uid', 'tenant_name', 'billing_month', 'bill_type_label', 'payment_method_label']}
                        searchPlaceholder="Search by Transaction ID, tenant, or bill type..."
                    />
                </div>
            </div>

            {/* Create Payment Modal */}
            <BillModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                }}
                title="Record Tenant Payment"
                formData={createForm.data}
                setData={createForm.setData}
                errors={createForm.errors}
                processing={createForm.processing}
                onSubmit={handleCreate}
                submitLabel="Record Payment"
                tenants={tenants}
            />

            {/* Delete Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Billing Entry</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
                            Are you sure you want to delete this billing entry{' '}
                            <strong>({selectedBill ? selectedBill.transaction_id : ''})</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

// ─── Bill Modal Component (Create only) ─────────────────────────────────────
interface BillModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    formData: BillFormData;
    setData: (key: keyof BillFormData, value: any) => void;
    errors: Partial<Record<keyof BillFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    submitLabel: string;
    tenants: Tenant[];
}

function BillModal({ open, onClose, title, formData, setData, errors, processing, onSubmit, submitLabel, tenants }: BillModalProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <DollarSign className="text-primary h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Tenant Select */}
                    <div className="grid gap-1.5">
                        <Label>
                            Select Tenant <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.tenant_uid} onValueChange={(v) => setData('tenant_uid', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select tenant..." />
                            </SelectTrigger>
                            <SelectContent>
                                {tenants.map((tenant) => (
                                    <SelectItem key={tenant.tenant_uid} value={tenant.tenant_uid}>
                                        {tenant.name} <span className="text-muted-foreground font-mono text-xs">({tenant.tenant_uid})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tenant_uid && <p className="text-destructive text-xs">{errors.tenant_uid}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="amount">
                                Amount (৳) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="e.g. 15000"
                            />
                            {errors.amount && <p className="text-destructive text-xs">{errors.amount}</p>}
                        </div>

                        {/* Billing Month */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="billing_month">
                                Billing Month <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="billing_month"
                                type="month"
                                value={formData.billing_month}
                                onChange={(e) => setData('billing_month', e.target.value)}
                            />
                            {errors.billing_month && <p className="text-destructive text-xs">{errors.billing_month}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Bill Type */}
                        <div className="grid gap-1.5">
                            <Label>
                                Bill Type <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.bill_type} onValueChange={(v) => setData('bill_type', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Rent (Monthly)</SelectItem>
                                    <SelectItem value="electricity">Electricity</SelectItem>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="gas">Gas</SelectItem>
                                    <SelectItem value="wifi">WiFi</SelectItem>
                                    <SelectItem value="dish">Satellite Dish</SelectItem>
                                    <SelectItem value="garage">Garage Cost</SelectItem>
                                    <SelectItem value="utility">Utility</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.bill_type && <p className="text-destructive text-xs">{errors.bill_type}</p>}
                        </div>

                        {/* Payment Method */}
                        <div className="grid gap-1.5">
                            <Label>
                                Payment Method <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                    <SelectItem value="bkash">bKash</SelectItem>
                                    <SelectItem value="nagad">Nagad</SelectItem>
                                    <SelectItem value="rocket">Rocket</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.payment_method && <p className="text-destructive text-xs">{errors.payment_method}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Sent Money To */}
                        <div className="grid gap-1.5">
                            <Label>
                                Receiver (Sent To) <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.sent_money_to} onValueChange={(v) => setData('sent_money_to', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select receiver..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flat_owner">Flat Owner</SelectItem>
                                    <SelectItem value="guard">Security Guard</SelectItem>
                                    <SelectItem value="society_lead">Society Lead</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.sent_money_to && <p className="text-destructive text-xs">{errors.sent_money_to}</p>}
                        </div>

                        {/* Status */}
                        <div className="grid gap-1.5">
                            <Label>
                                Status <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="denied">Denied</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-destructive text-xs">{errors.status}</p>}
                        </div>
                    </div>

                    {/* Transaction ID */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="transaction_id">Transaction ID</Label>
                        <Input
                            id="transaction_id"
                            value={formData.transaction_id}
                            onChange={(e) => setData('transaction_id', e.target.value)}
                            placeholder="Auto-generated if left blank"
                        />
                        {errors.transaction_id && <p className="text-destructive text-xs">{errors.transaction_id}</p>}
                    </div>

                    {/* Note */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="note">Notes / Remarks</Label>
                        <Input
                            id="note"
                            value={formData.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="Add reference note (optional)"
                        />
                        {errors.note && <p className="text-destructive text-xs">{errors.note}</p>}
                    </div>
                </div>

                <DialogFooter className="mt-2">
                    <DialogClose asChild>
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={onSubmit} disabled={processing}>
                        {processing ? 'Saving...' : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}