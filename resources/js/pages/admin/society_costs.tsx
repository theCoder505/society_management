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
import { Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Society Expenditure',
        href: '/admin/society-expenditure',
    },
];

interface SocietyCost {
    id: number;
    cost_uid: string;
    cost_type: 'guard_fee' | 'development_fee' | 'lift_fee' | 'monthly_fee' | 'new_installation' | 'other';
    development_uid: string | null;
    amount: string;
    payment_method: string;
    cost_details: string | null;
    created_at: string;
}

interface SocietyDevelopment {
    development_uid: string;
    title: string;
}

interface Props {
    costs: SocietyCost[];
    developments: SocietyDevelopment[];
}

interface CostFormData {
    cost_uid?: string;
    cost_type: string;
    development_uid: string;
    amount: string;
    payment_method: string;
    cost_details: string;
    [key: string]: string | undefined;
}

const emptyForm = (): CostFormData => ({
    cost_type: '',
    development_uid: '',
    amount: '',
    payment_method: 'cash',
    cost_details: '',
});

export default function SocietyCosts({ costs, developments }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCost, setSelectedCost] = useState<SocietyCost | null>(null);

    const createForm = useForm<CostFormData>(emptyForm());
    const editForm = useForm<CostFormData>(emptyForm());

    // Map development_uid to title
    const devTitleMap = useMemo(() => {
        const map: Record<string, string> = {};
        developments.forEach((d) => {
            map[d.development_uid] = d.title;
        });
        return map;
    }, [developments]);

    // Handle Create Submission
    const handleCreate = () => {
        createForm.post(route('society.costs.create'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    // Open Edit Modal
    const handleEditOpen = (cost: SocietyCost) => {
        setSelectedCost(cost);
        editForm.setData({
            cost_uid: cost.cost_uid,
            cost_type: cost.cost_type,
            development_uid: cost.development_uid || '',
            amount: cost.amount,
            payment_method: cost.payment_method,
            cost_details: cost.cost_details || '',
        });
        setShowEditModal(true);
    };

    // Handle Edit Submission
    const handleUpdate = () => {
        editForm.put(route('society.costs.update'), {
            onSuccess: () => {
                setShowEditModal(false);
                editForm.reset();
            },
        });
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedCost) return;
        router.delete(route('society.costs.delete'), {
            data: { cost_uid: selectedCost.cost_uid },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedCost(null);
            },
        });
    };

    const costTypeLabels: Record<string, string> = {
        guard_fee: 'Guard Salary / Fee',
        development_fee: 'Development Project',
        lift_fee: 'Lift Maintenance',
        monthly_fee: 'Monthly General Cost',
        new_installation: 'New Installation',
        other: 'Other Cost',
    };

    const costTypeColors: Record<string, string> = {
        guard_fee: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        development_fee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        lift_fee: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        monthly_fee: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        new_installation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
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

    // Columns
    const columns = [
        {
            header: 'Cost UID',
            accessor: 'cost_uid' as keyof SocietyCost,
            sortable: true,
            sortKey: 'cost_uid' as keyof SocietyCost,
        },
        {
            header: 'Cost Type',
            accessor: (row: SocietyCost) => (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${costTypeColors[row.cost_type]}`}>
                    {costTypeLabels[row.cost_type] || row.cost_type}
                </span>
            ),
            sortable: true,
            sortKey: 'cost_type' as keyof SocietyCost,
        },
        {
            header: 'Details',
            accessor: (row: SocietyCost) => (
                <span className="text-foreground block max-w-xs truncate text-sm font-medium">
                    {row.cost_details || <span className="text-muted-foreground italic">No details</span>}
                </span>
            ),
        },
        {
            header: 'Amount',
            accessor: (row: SocietyCost) => (
                <span className="text-foreground font-semibold">৳{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            ),
            sortable: true,
            sortKey: 'amount' as keyof SocietyCost,
        },
        {
            header: 'Payment Method',
            accessor: (row: SocietyCost) => (
                <span className="text-foreground text-sm">{paymentMethods[row.payment_method] || row.payment_method}</span>
            ),
        },
        {
            header: 'Linked Project',
            accessor: (row: SocietyCost) => (
                <span className="text-sm">
                    {row.development_uid ? (
                        devTitleMap[row.development_uid] || row.development_uid
                    ) : (
                        <span className="text-muted-foreground italic">None</span>
                    )}
                </span>
            ),
        },
        {
            header: 'Date Spent',
            accessor: (row: SocietyCost) => new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sortable: true,
            sortKey: 'created_at' as keyof SocietyCost,
        },
        {
            header: 'Actions',
            accessor: (row: SocietyCost) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditOpen(row)}>
                        <Pencil className="text-muted-foreground h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                            setSelectedCost(row);
                            setShowDeleteDialog(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Format data for search indexing
    const tableData = useMemo(() => {
        return costs.map((cost) => ({
            ...cost,
            cost_type_label: costTypeLabels[cost.cost_type] || '',
            payment_method_label: paymentMethods[cost.payment_method] || '',
            dev_title: cost.development_uid ? devTitleMap[cost.development_uid] || '' : '',
        }));
    }, [costs, devTitleMap]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Society Expenditure</h1>
                        <p className="text-muted-foreground text-sm">
                            Log and manage community expenses, utility bills, guard wages, and development disbursements
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Log Expense
                    </Button>
                </div>

                <div className="mt-4">
                    <SearchableTable
                        data={tableData}
                        columns={columns}
                        searchKeys={['cost_uid', 'cost_type_label', 'cost_details', 'amount', 'payment_method_label', 'dev_title']}
                        searchPlaceholder="Search by expense UID, type, project, or details..."
                    />
                </div>
            </div>

            {/* Create Cost Modal */}
            <SocietyCostModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                }}
                title="Log Society Expense"
                formData={createForm.data}
                setData={createForm.setData}
                errors={createForm.errors}
                processing={createForm.processing}
                onSubmit={handleCreate}
                submitLabel="Record Expense"
                developments={developments}
            />

            {/* Edit Cost Modal */}
            <SocietyCostModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    editForm.reset();
                }}
                title="Edit Expenditure Record"
                formData={editForm.data}
                setData={editForm.setData}
                errors={editForm.errors}
                processing={editForm.processing}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                developments={developments}
            />

            {/* Delete Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Expense Entry</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
                            Are you sure you want to delete this society expense entry <strong>{selectedCost ? selectedCost.cost_uid : ''}</strong>?
                            This expenditure will be deleted from auditing records.
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

// ─── Society Cost Modal Component ────────────────────────────────────────────────────────
interface SocietyCostModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    formData: CostFormData;
    setData: (key: keyof CostFormData, value: string) => void;
    errors: Partial<Record<keyof CostFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    submitLabel: string;
    developments: SocietyDevelopment[];
}

function SocietyCostModal({
    open,
    onClose,
    title,
    formData,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    developments,
}: SocietyCostModalProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <Wallet className="text-primary h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Cost Type */}
                    <div className="grid gap-1.5">
                        <Label>
                            Expense Category <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.cost_type} onValueChange={(v) => setData('cost_type', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="guard_fee">Guard Salary / Fee</SelectItem>
                                <SelectItem value="development_fee">Development Project</SelectItem>
                                <SelectItem value="lift_fee">Lift Maintenance</SelectItem>
                                <SelectItem value="monthly_fee">Monthly General Cost</SelectItem>
                                <SelectItem value="new_installation">New Installation</SelectItem>
                                <SelectItem value="other">Other Cost</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.cost_type && <p className="text-destructive text-xs">{errors.cost_type}</p>}
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
                                placeholder="e.g. 1200"
                            />
                            {errors.amount && <p className="text-destructive text-xs">{errors.amount}</p>}
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

                    {/* Linked Development Project (Conditional) */}
                    {formData.cost_type === 'development_fee' && (
                        <div className="grid gap-1.5">
                            <Label>
                                Linked Development Project <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.development_uid} onValueChange={(v) => setData('development_uid', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {developments.map((dev) => (
                                        <SelectItem key={dev.development_uid} value={dev.development_uid}>
                                            {dev.title} <span className="text-muted-foreground font-mono text-xs">({dev.development_uid})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.development_uid && <p className="text-destructive text-xs">{errors.development_uid}</p>}
                        </div>
                    )}

                    {/* Details */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="cost_details">Expense Details</Label>
                        <textarea
                            id="cost_details"
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={formData.cost_details}
                            onChange={(e) => setData('cost_details', e.target.value)}
                            placeholder="Add brief details about this expenditure (receivers, invoice numbers etc.)"
                        />
                        {errors.cost_details && <p className="text-destructive text-xs">{errors.cost_details}</p>}
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
