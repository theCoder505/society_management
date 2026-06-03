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
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, HelpCircle, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notices',
        href: '/admin/tenant-notices',
    },
];

interface Notice {
    id: number;
    notice_uid: string;
    from_owner_uid: string;
    to_tenant_uid: string;
    title: string;
    notice_details: string;
    is_complied: boolean;
    complied_at: string | null;
    created_at: string;
}

interface Tenant {
    tenant_uid: string;
    name: string;
}

interface FlatOwner {
    owner_uid: string;
    name: string;
}

interface Props {
    notices: Notice[];
    tenants: Tenant[];
    owners: FlatOwner[];
}

interface NoticeFormData {
    notice_uid?: string;
    from_owner_uid: string;
    to_tenant_uid: string;
    title: string;
    notice_details: string;
    is_complied: boolean;
    [key: string]: string | boolean | undefined;
}

const emptyForm = (): NoticeFormData => ({
    from_owner_uid: 'ADMIN',
    to_tenant_uid: '',
    title: '',
    notice_details: '',
    is_complied: false,
});

export default function TenantNotices({ notices, tenants, owners }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

    const createForm = useForm<NoticeFormData>(emptyForm());
    const editForm = useForm<NoticeFormData>(emptyForm());

    // Map tenant_uid to name
    const tenantNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        tenants.forEach((t) => {
            map[t.tenant_uid] = t.name;
        });
        return map;
    }, [tenants]);

    // Map owner_uid to name
    const ownerNameMap = useMemo(() => {
        const map: Record<string, string> = {
            ADMIN: 'Society Lead (Admin)',
        };
        owners.forEach((o) => {
            map[o.owner_uid] = o.name;
        });
        return map;
    }, [owners]);

    // Handle Create Submission
    const handleCreate = () => {
        createForm.post(route('tenants.notices.create'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    // Open Edit Modal
    const handleEditOpen = (notice: Notice) => {
        setSelectedNotice(notice);
        editForm.setData({
            notice_uid: notice.notice_uid,
            from_owner_uid: notice.from_owner_uid,
            to_tenant_uid: notice.to_tenant_uid,
            title: notice.title,
            notice_details: notice.notice_details,
            is_complied: !!notice.is_complied,
        });
        setShowEditModal(true);
    };

    // Handle Edit Submission
    const handleUpdate = () => {
        editForm.put(route('tenants.notices.update'), {
            onSuccess: () => {
                setShowEditModal(false);
                editForm.reset();
            },
        });
    };

    // Handle Delete
    const handleDelete = () => {
        if (!selectedNotice) return;
        router.delete(route('tenants.notices.delete'), {
            data: { notice_uid: selectedNotice.notice_uid },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedNotice(null);
            },
        });
    };

    // Columns
    const columns = [
        {
            header: 'Notice UID',
            accessor: 'notice_uid' as keyof Notice,
            sortable: true,
            sortKey: 'notice_uid' as keyof Notice,
        },
        {
            header: 'Sender (Owner)',
            accessor: (row: Notice) => <span className="text-foreground font-medium">{ownerNameMap[row.from_owner_uid] || row.from_owner_uid}</span>,
        },
        {
            header: 'Recipient (Tenant)',
            accessor: (row: Notice) => (
                <div>
                    <p className="text-foreground font-medium">{tenantNameMap[row.to_tenant_uid] || 'Unknown Tenant'}</p>
                    <p className="text-muted-foreground font-mono text-xs">{row.to_tenant_uid}</p>
                </div>
            ),
        },
        {
            header: 'Title',
            accessor: (row: Notice) => (
                <div>
                    <p className="text-foreground font-semibold">{row.title}</p>
                    <p className="text-muted-foreground line-clamp-1 max-w-xs text-xs">{row.notice_details}</p>
                </div>
            ),
        },
        {
            header: 'Complied',
            accessor: (row: Notice) => (
                <div className="flex items-center gap-1.5">
                    {row.is_complied ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle className="h-3 w-3" />
                            Yes
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            <HelpCircle className="h-3 w-3" />
                            Pending
                        </span>
                    )}
                    {row.complied_at && (
                        <span className="text-muted-foreground text-[10px]">
                            {new Date(row.complied_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                    )}
                </div>
            ),
            sortable: true,
            sortKey: 'is_complied' as keyof Notice,
        },
        {
            header: 'Date Issued',
            accessor: (row: Notice) => new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sortable: true,
            sortKey: 'created_at' as keyof Notice,
        },
        {
            header: 'Actions',
            className: 'text-end max-w-[100px]',
            accessor: (row: Notice) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditOpen(row)}>
                        <Pencil className="text-muted-foreground h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                            setSelectedNotice(row);
                            setShowDeleteDialog(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Format data for search index
    const tableData = useMemo(() => {
        return notices.map((notice) => ({
            ...notice,
            tenant_name: tenantNameMap[notice.to_tenant_uid] || '',
            owner_name: ownerNameMap[notice.from_owner_uid] || '',
        }));
    }, [notices, tenantNameMap, ownerNameMap]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tenant Notices</h1>
                        <p className="text-muted-foreground text-sm">
                            Issue notice directives, track warnings, and monitor compliance status for residents
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Notice
                    </Button>
                </div>

                <div className="mt-4">
                    <SearchableTable
                        data={tableData}
                        columns={columns}
                        searchKeys={['notice_uid', 'to_tenant_uid', 'tenant_name', 'owner_name', 'title', 'notice_details']}
                        searchPlaceholder="Search by UID, tenant, owner or title..."
                    />
                </div>
            </div>

            {/* Create Notice Modal */}
            <NoticeModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                }}
                title="Create Notice Directive"
                formData={createForm.data}
                setData={createForm.setData}
                errors={createForm.errors}
                processing={createForm.processing}
                onSubmit={handleCreate}
                submitLabel="Issue Notice"
                tenants={tenants}
                owners={owners}
            />

            {/* Edit Notice Modal */}
            <NoticeModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    editForm.reset();
                }}
                title="Update Notice Record"
                formData={editForm.data}
                setData={editForm.setData}
                errors={editForm.errors}
                processing={editForm.processing}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                tenants={tenants}
                owners={owners}
            />

            {/* Delete Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Notice Directive</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
                            Are you sure you want to delete notice <strong>{selectedNotice ? selectedNotice.title : ''}</strong>? This directive will
                            be permanently removed from the tenant portal.
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

// ─── Notice Modal Component ────────────────────────────────────────────────────────
interface NoticeModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    formData: NoticeFormData;
    setData: (key: keyof NoticeFormData, value: any) => void;
    errors: Partial<Record<keyof NoticeFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    submitLabel: string;
    tenants: Tenant[];
    owners: FlatOwner[];
}

function NoticeModal({ open, onClose, title, formData, setData, errors, processing, onSubmit, submitLabel, tenants, owners }: NoticeModalProps) {
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
                        <Newspaper className="text-primary h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* From Sender (Owner / Admin) */}
                    <div className="grid gap-1.5">
                        <Label>
                            Sender Profile <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.from_owner_uid} onValueChange={(v) => setData('from_owner_uid', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Sender..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Society Lead (Admin)</SelectItem>
                                {owners.map((owner) => (
                                    <SelectItem key={owner.owner_uid} value={owner.owner_uid}>
                                        Owner: {owner.name} <span className="text-muted-foreground font-mono text-xs">({owner.owner_uid})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.from_owner_uid && <p className="text-destructive text-xs">{errors.from_owner_uid}</p>}
                    </div>

                    {/* To Recipient Tenant */}
                    <div className="grid gap-1.5">
                        <Label>
                            Recipient Tenant <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.to_tenant_uid} onValueChange={(v) => setData('to_tenant_uid', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select recipient..." />
                            </SelectTrigger>
                            <SelectContent>
                                {tenants.map((tenant) => (
                                    <SelectItem key={tenant.tenant_uid} value={tenant.tenant_uid}>
                                        {tenant.name} <span className="text-muted-foreground font-mono text-xs">({tenant.tenant_uid})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.to_tenant_uid && <p className="text-destructive text-xs">{errors.to_tenant_uid}</p>}
                    </div>

                    {/* Notice Title */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="notice-title">
                            Notice Subject <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="notice-title"
                            value={formData.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Excessive noise complaint"
                        />
                        {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
                    </div>

                    {/* Notice Details */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="notice-details">
                            Detailed Directives <span className="text-destructive">*</span>
                        </Label>
                        <textarea
                            id="notice-details"
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={formData.notice_details}
                            onChange={(e) => setData('notice_details', e.target.value)}
                            placeholder="State the guidelines, warnings, or detailed requests here..."
                        />
                        {errors.notice_details && <p className="text-destructive text-xs">{errors.notice_details}</p>}
                    </div>

                    {/* Complied Checkbox */}
                    <div className="flex items-center space-x-2 py-1">
                        <Checkbox id="is_complied" checked={formData.is_complied} onCheckedChange={(checked) => setData('is_complied', !!checked)} />
                        <Label htmlFor="is_complied" className="cursor-pointer font-medium">
                            Mark as Complied (Resolved)
                        </Label>
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
