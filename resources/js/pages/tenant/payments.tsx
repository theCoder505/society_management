import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { SearchableTable } from '@/components/SearchableTable';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, CreditCard, CheckCircle, Clock, XCircle, Info, Sparkles, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Payments & Bills',
        href: '/tenant/payments',
    },
];

interface Bill {
    id: number;
    transaction_id: string;
    amount: string;
    status: 'pending' | 'accepted' | 'denied';
    billing_month: string;
    payment_method: string;
    bill_type: string;
    sent_money_to: string;
    note: string;
    is_admin_modified: boolean;
    created_at: string;
    // computed search helper (added client-side)
    _search?: string;
}

interface Flat {
    id: number;
    flatID: string;
    rent_price: string;
    flat_size: string;
}

interface PaymentsProps {
    bills: Bill[];
    flats: Flat[];
    currentMonth: string;
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

export default function TenantPayments({ bills, flats, currentMonth }: PaymentsProps) {
    // Build a single _search string per row covering all searchable content,
    // including every amount format and the ৳ symbol, so SearchableTable's
    // simple substring match works regardless of how the user types the query.
    const enrichedBills: Bill[] = bills.map((b) => {
        const amt = parseFloat(b.amount);
        const amtVariants = [
            b.amount,                                                                    // "13500"
            amt.toFixed(2),                                                              // "13500.00"
            amt.toLocaleString('en-IN'),                                                 // "13,500"
            amt.toLocaleString('en-IN', { minimumFractionDigits: 2 }),                   // "13,500.00"
            `৳${amt.toLocaleString('en-IN')}`,                                           // "৳13,500"
            `৳${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,             // "৳13,500.00"
        ].join(' ');
        return {
            ...b,
            _search: [b.transaction_id.trim(), amtVariants, b.note ?? ''].join(' '),
        };
    });

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    const uploadForm = useForm({
        transaction_id: '',
        amount: '',
        payment_method: 'bkash',
        bill_type: 'monthly',
        sent_money_to: 'flat_owner',
        note: '',
    });

    const editForm = useForm({
        id: 0,
        transaction_id: '',
        amount: '',
        payment_method: 'bkash',
        bill_type: 'monthly',
        sent_money_to: 'flat_owner',
        note: '',
    });

    const deleteForm = useForm({
        id: 0,
    });

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post('/tenant/payments/upload', {
            onSuccess: () => {
                setShowUploadModal(false);
                uploadForm.reset();
            },
        });
    };

    const handleEditOpen = (bill: Bill) => {
        setSelectedBill(bill);
        editForm.setData({
            id: bill.id,
            transaction_id: bill.transaction_id,
            amount: bill.amount,
            payment_method: bill.payment_method,
            bill_type: bill.bill_type,
            sent_money_to: bill.sent_money_to,
            note: bill.note ?? '',
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.post('/tenant/payments/edit', {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedBill(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteOpen = (bill: Bill) => {
        setSelectedBill(bill);
        deleteForm.setData('id', bill.id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        deleteForm.delete('/tenant/payments/delete', {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedBill(null);
                deleteForm.reset();
            },
        });
    };

    // Columns config for SearchableTable
    const columns = [
        {
            header: 'Transaction ID',
            accessor: (row: Bill) => (
                <div className="font-mono text-sm font-semibold text-foreground">
                    {row.transaction_id}
                    {row.is_admin_modified && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-400">
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
            accessor: (row: Bill) => <span className="text-sm">{payMethods[row.payment_method] || row.payment_method}</span>,
        },
        {
            header: 'Amount',
            accessor: (row: Bill) => (
                <span className="font-semibold text-foreground">
                    ৳{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
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
                    accepted: <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />,
                    denied: <XCircle className="h-3.5 w-3.5 text-red-500 mr-1" />,
                    pending: <Clock className="h-3.5 w-3.5 text-amber-500 mr-1" />,
                };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[row.status]}`}>
                        {icons[row.status]}
                        <span className="capitalize">{row.status}</span>
                    </span>
                );
            },
        },
        {
            header: 'Submitted On',
            accessor: (row: Bill) =>
                new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sortable: true,
            sortKey: 'created_at' as keyof Bill,
        },
        {
            header: 'Note',
            accessor: (row: Bill) => (
                <span className="text-sm text-muted-foreground max-w-[160px] truncate block" title={row.note || undefined}>
                    {row.note ? row.note : <span className="italic text-muted-foreground/50">—</span>}
                </span>
            ),
        },
        {
            header: 'Actions',
            className: 'text-end',
            accessor: (row: Bill) => {
                if (row.status !== 'pending') return <span className="text-xs text-muted-foreground">—</span>;
                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => handleEditOpen(row)}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/20"
                            onClick={() => handleDeleteOpen(row)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    // Current month name for formatting
    const currentMonthName = new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Shared form fields renderer to avoid duplication
    type PaymentFormData = { transaction_id: string; amount: string; payment_method: string; bill_type: string; sent_money_to: string; note: string };
    type AnyPaymentForm = { data: PaymentFormData; errors: Partial<Record<string, string>>; setData(key: keyof PaymentFormData, value: string): void };
    const renderFormFields = (
        form: AnyPaymentForm,
        isEdit = false,
    ) => (
        <>
            <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3.5 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-400">
                <p className="font-semibold flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" />
                    Payment logged for: {currentMonthName}
                </p>
                <p className="mt-1">Please ensure your Transaction ID is typed exactly as provided by your payment agent.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${isEdit ? 'edit_' : ''}transaction_id`}>
                    Transaction ID / Reference <span className="text-destructive">*</span>
                </Label>
                <Input
                    id={`${isEdit ? 'edit_' : ''}transaction_id`}
                    required
                    value={form.data.transaction_id}
                    onChange={(e) => form.setData('transaction_id', e.target.value)}
                    placeholder="e.g. BK893JS291"
                />
                {form.errors.transaction_id && <p className="text-xs text-destructive">{form.errors.transaction_id}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${isEdit ? 'edit_' : ''}amount`}>
                    Amount Paid (BDT) <span className="text-destructive">*</span>
                </Label>
                <Input
                    id={`${isEdit ? 'edit_' : ''}amount`}
                    type="number"
                    required
                    min="1"
                    value={form.data.amount}
                    onChange={(e) => form.setData('amount', e.target.value)}
                    placeholder="e.g. 14500"
                />
                {form.errors.amount && <p className="text-xs text-destructive">{form.errors.amount}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor={`${isEdit ? 'edit_' : ''}bill_type`}>
                        Bill Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={form.data.bill_type}
                        onValueChange={(v) => form.setData('bill_type', v)}
                    >
                        <SelectTrigger id={`${isEdit ? 'edit_' : ''}bill_type`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly Rent</SelectItem>
                            <SelectItem value="electricity">Electricity Bill</SelectItem>
                            <SelectItem value="water">Water Bill</SelectItem>
                            <SelectItem value="gas">Gas Bill</SelectItem>
                            <SelectItem value="wifi">WiFi Bill</SelectItem>
                            <SelectItem value="dish">Cable Dish</SelectItem>
                            <SelectItem value="garage">Garage Cost</SelectItem>
                            <SelectItem value="utility">Utility Charge</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${isEdit ? 'edit_' : ''}payment_method`}>
                        Payment Method <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={form.data.payment_method}
                        onValueChange={(v) => form.setData('payment_method', v)}
                    >
                        <SelectTrigger id={`${isEdit ? 'edit_' : ''}payment_method`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bkash">bKash</SelectItem>
                            <SelectItem value="nagad">Nagad</SelectItem>
                            <SelectItem value="rocket">Rocket</SelectItem>
                            <SelectItem value="card">Card Payment</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="cash">Cash Payment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${isEdit ? 'edit_' : ''}sent_money_to`}>
                    Recipient <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={form.data.sent_money_to}
                    onValueChange={(v) => form.setData('sent_money_to', v)}
                >
                    <SelectTrigger id={`${isEdit ? 'edit_' : ''}sent_money_to`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="flat_owner">Flat Owner</SelectItem>
                        <SelectItem value="society_lead">Society Lead (Admin)</SelectItem>
                        <SelectItem value="guard">Building Guard</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${isEdit ? 'edit_' : ''}note`}>Optional Note</Label>
                <Textarea
                    id={`${isEdit ? 'edit_' : ''}note`}
                    rows={2}
                    value={form.data.note}
                    onChange={(e) => form.setData('note', e.target.value)}
                    placeholder="Add billing details or explanations"
                    className="resize-none"
                />
            </div>
        </>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Payments" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Payments & Receipts</h1>
                        <p className="text-muted-foreground text-sm">Upload payment confirmations and track approval status</p>
                    </div>
                    <Button onClick={() => { uploadForm.reset(); setShowUploadModal(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Submit Payment Receipt
                    </Button>
                </div>

                {/* Info Card for Current Rent Obligations */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="bg-card md:col-span-2 rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                            <Sparkles className="h-4.5 w-4.5 text-primary" />
                            Active Rent & Garage Costs
                        </h3>
                        <div className="space-y-4">
                            {flats.map((flat) => (
                                <div key={flat.id} className="flex flex-col gap-2 p-3 bg-muted/40 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">Flat: {flat.flatID}</span>
                                        <span className="text-xs text-muted-foreground">Size: {flat.flat_size} sqft</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs mt-1">
                                        <div>
                                            <p className="text-muted-foreground">Monthly Rent</p>
                                            <p className="font-bold text-foreground text-sm">৳{parseFloat(flat.rent_price).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground flex items-center gap-1">
                                                Garage Access Fee
                                                <span title="Garage fees are automatically credited to the society treasury."><Info className="h-3 w-3 text-muted-foreground" /></span>
                                            </p>
                                            <p className="font-bold text-foreground text-sm">Included in utilities/rent</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800 flex flex-col justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground mb-1">Billing Month</h3>
                            <p className="text-2xl font-extrabold text-primary">{currentMonthName}</p>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                You can only upload receipts for the current month. Past or future month corrections must be requested from the administration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                    <h3 className="font-bold text-lg text-foreground mb-4">Payment Receipts History</h3>
                    <SearchableTable
                        data={enrichedBills}
                        columns={columns}
                        searchKeys={['_search']}
                        searchPlaceholder="Search by transaction ID, amount, or note..."
                        rowsPerPage={10}
                    />
                </div>
            </div>

            {/* Upload Payment Modal */}
            <Dialog open={showUploadModal} onOpenChange={(v) => { if (!v) setShowUploadModal(false); }}>
                <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Submit Payment Confirmation
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
                        {renderFormFields(uploadForm, false)}

                        <DialogFooter className="mt-4 gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={uploadForm.processing}>
                                {uploadForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Upload Receipt
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Payment Modal */}
            <Dialog open={showEditModal} onOpenChange={(v) => { if (!v) { setShowEditModal(false); setSelectedBill(null); } }}>
                <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Pencil className="h-5 w-5 text-primary" />
                            Edit Payment Receipt
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        {/* hidden id field handled via editForm.data.id */}
                        {renderFormFields(editForm, true)}

                        <DialogFooter className="mt-4 gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={(v) => { if (!v) { setShowDeleteModal(false); setSelectedBill(null); } }}>
                <DialogContent className="w-full max-w-md dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            Delete Payment Receipt
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-2 space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this payment receipt? This action cannot be undone.
                        </p>
                        {selectedBill && (
                            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Transaction ID</span>
                                    <span className="font-mono font-semibold">{selectedBill.transaction_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-semibold">৳{parseFloat(selectedBill.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bill Type</span>
                                    <span>{billTypes[selectedBill.bill_type] || selectedBill.bill_type}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleteForm.processing}
                            onClick={handleDeleteConfirm}
                        >
                            {deleteForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                            Delete Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}