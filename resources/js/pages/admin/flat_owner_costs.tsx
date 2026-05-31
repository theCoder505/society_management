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
import { BadgeDollarSign, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Flat Owner Costs',
        href: '/admin/flat-owner-costs',
    },
];

interface FlatOwnerCost {
    id: number;
    cost_uid: string;
    owner_uid: string;
    amount: string;
    cost_type: 'monthly_fee' | 'installment' | 'maintainance' | 'service_cost' | 'development_fee';
    development_uid: string | null;
    created_at: string;
}

interface FlatOwner {
    owner_uid: string;
    name: string;
}

interface SocietyDevelopment {
    development_uid: string;
    title: string;
}

interface Props {
    costs: FlatOwnerCost[];
    owners: FlatOwner[];
    developments: SocietyDevelopment[];
}

interface CostFormData {
    cost_uid?: string;
    owner_uid: string;
    amount: string;
    cost_type: string;
    development_uid: string;
    [key: string]: string | undefined;
}

const emptyForm = (): CostFormData => ({
    owner_uid: '',
    amount: '',
    cost_type: '',
    development_uid: '',
});

export default function FlatOwnerCosts({ costs, owners, developments }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCost, setSelectedCost] = useState<FlatOwnerCost | null>(null);

    const createForm = useForm<CostFormData>(emptyForm());
    const editForm = useForm<CostFormData>(emptyForm());

    // Map owner_uid to name for easy lookup
    const ownerNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        owners.forEach((o) => {
            map[o.owner_uid] = o.name;
        });
        return map;
    }, [owners]);

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
        createForm.post(route('costs.flat_owners.create'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    // Open Edit Modal
    const handleEditOpen = (cost: FlatOwnerCost) => {
        setSelectedCost(cost);
        editForm.setData({
            cost_uid: cost.cost_uid,
            owner_uid: cost.owner_uid,
            amount: cost.amount,
            cost_type: cost.cost_type,
            development_uid: cost.development_uid || '',
        });
        setShowEditModal(true);
    };

    // Handle Edit Submission
    const handleUpdate = () => {
        editForm.put(route('costs.flat_owners.update'), {
            onSuccess: () => {
                setShowEditModal(false);
                editForm.reset();
            },
        });
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedCost) return;
        router.delete(route('costs.flat_owners.delete'), {
            data: { cost_uid: selectedCost.cost_uid },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedCost(null);
            },
        });
    };

    const costTypeLabels: Record<string, string> = {
        monthly_fee: 'Monthly Fee',
        installment: 'Installment',
        maintainance: 'Maintenance',
        service_cost: 'Service Cost',
        development_fee: 'Development Fee',
    };

    const costTypeColors: Record<string, string> = {
        monthly_fee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        installment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        maintainance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        service_cost: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        development_fee: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    };

    // Prepare table columns
    const columns = [
        {
            header: 'Cost UID',
            accessor: 'cost_uid' as keyof FlatOwnerCost,
            sortable: true,
            sortKey: 'cost_uid' as keyof FlatOwnerCost,
        },
        {
            header: 'Flat Owner',
            accessor: (row: FlatOwnerCost) => (
                <div>
                    <p className="text-foreground font-medium">{ownerNameMap[row.owner_uid] || 'Unknown Owner'}</p>
                    <p className="text-muted-foreground font-mono text-xs">{row.owner_uid}</p>
                </div>
            ),
        },
        {
            header: 'Cost Type',
            accessor: (row: FlatOwnerCost) => (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${costTypeColors[row.cost_type] || 'bg-gray-100 text-gray-800'}`}>
                    {costTypeLabels[row.cost_type] || row.cost_type}
                </span>
            ),
        },
        {
            header: 'Amount',
            accessor: (row: FlatOwnerCost) => (
                <span className="text-foreground font-medium">৳{parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            ),
            sortable: true,
            sortKey: 'amount' as keyof FlatOwnerCost,
        },
        {
            header: 'Linked Development',
            accessor: (row: FlatOwnerCost) => (
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
            header: 'Date Created',
            accessor: (row: FlatOwnerCost) =>
                new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sortable: true,
            sortKey: 'created_at' as keyof FlatOwnerCost,
        },
        {
            header: 'Actions',
            accessor: (row: FlatOwnerCost) => (
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
            owner_name: ownerNameMap[cost.owner_uid] || '',
            dev_title: cost.development_uid ? devTitleMap[cost.development_uid] || '' : '',
        }));
    }, [costs, ownerNameMap, devTitleMap]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Flat Owner Costs</h1>
                        <p className="text-muted-foreground text-sm">
                            Issue and manage costs, maintenance charges, and development fees for flat owners
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Owner Cost
                    </Button>
                </div>

                <div className="mt-4">
                    <SearchableTable
                        data={tableData}
                        columns={columns}
                        searchKeys={['cost_uid', 'owner_uid', 'owner_name', 'cost_type', 'dev_title']}
                        searchPlaceholder="Search by UID, owner name, or type..."
                    />
                </div>
            </div>

            {/* Create Cost Modal */}
            <CostModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                }}
                title="Issue Cost to Owner"
                formData={createForm.data}
                setData={createForm.setData}
                errors={createForm.errors}
                processing={createForm.processing}
                onSubmit={handleCreate}
                submitLabel="Issue Cost"
                owners={owners}
                developments={developments}
            />

            {/* Edit Cost Modal */}
            <CostModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    editForm.reset();
                }}
                title="Edit Owner Cost Record"
                formData={editForm.data}
                setData={editForm.setData}
                errors={editForm.errors}
                processing={editForm.processing}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                owners={owners}
                developments={developments}
            />

            {/* Delete Confirmation Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Cost Record</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
                            Are you sure you want to delete the cost record for{' '}
                            <strong>{selectedCost ? ownerNameMap[selectedCost.owner_uid] : ''}</strong> of amount{' '}
                            <strong>৳{selectedCost ? parseFloat(selectedCost.amount).toFixed(2) : ''}</strong>? This action cannot be undone.
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

// ─── Cost Modal Component ────────────────────────────────────────────────────────
interface CostModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    formData: CostFormData;
    setData: (key: keyof CostFormData, value: string) => void;
    errors: Partial<Record<keyof CostFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    submitLabel: string;
    owners: FlatOwner[];
    developments: SocietyDevelopment[];
}

function CostModal({ open, onClose, title, formData, setData, errors, processing, onSubmit, submitLabel, owners, developments }: CostModalProps) {
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
                        <BadgeDollarSign className="text-primary h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Owner Select */}
                    <div className="grid gap-1.5">
                        <Label>
                            Flat Owner <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.owner_uid} onValueChange={(v) => setData('owner_uid', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select flat owner..." />
                            </SelectTrigger>
                            <SelectContent>
                                {owners.map((owner) => (
                                    <SelectItem key={owner.owner_uid} value={owner.owner_uid}>
                                        {owner.name} <span className="text-muted-foreground font-mono text-xs">({owner.owner_uid})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.owner_uid && <p className="text-destructive text-xs">{errors.owner_uid}</p>}
                    </div>

                    {/* Cost Type Select */}
                    <div className="grid gap-1.5">
                        <Label>
                            Cost Type <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.cost_type} onValueChange={(v) => setData('cost_type', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly_fee">Monthly Fee</SelectItem>
                                <SelectItem value="installment">Installment</SelectItem>
                                <SelectItem value="maintainance">Maintenance Fee</SelectItem>
                                <SelectItem value="service_cost">Service Cost</SelectItem>
                                <SelectItem value="development_fee">Development Fee</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.cost_type && <p className="text-destructive text-xs">{errors.cost_type}</p>}
                    </div>

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
                            placeholder="e.g. 5000"
                        />
                        {errors.amount && <p className="text-destructive text-xs">{errors.amount}</p>}
                    </div>

                    {/* Linked Development Project (Conditional) */}
                    {formData.cost_type === 'development_fee' && (
                        <div className="grid gap-1.5">
                            <Label>
                                Linked Development Project <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.development_uid} onValueChange={(v) => setData('development_uid', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select development project..." />
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
