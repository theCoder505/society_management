import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { SearchableTable } from '@/components/SearchableTable';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Megaphone, Newspaper, CheckCircle2, Clock, LoaderCircle } from 'lucide-react';
import FlashMessage from '../FlashMessage';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Issued Notices',
        href: '/owner/notices',
    },
];

interface Tenant {
    tenant_uid: string;
    name: string;
}

interface Notice {
    id: number;
    notice_uid: string;
    to_tenant_uid: string;
    title: string;
    notice_details: string;
    is_complied: boolean;
    complied_at: string | null;
    created_at: string;
}

interface Announcement {
    id: number;
    title: string;
    announcement_details: string;
    created_at: string;
}

interface NoticesProps {
    notices: Notice[];
    tenants: Tenant[];
    announcements: Announcement[];
}

export default function OwnerNotices({ notices, tenants, announcements }: NoticesProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

    const createForm = useForm({
        to_tenant_uid: '',
        title: '',
        notice_details: '',
    });

    const editForm = useForm({
        id: '',
        title: '',
        notice_details: '',
    });

    const tenantNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        tenants.forEach((t) => {
            map[t.tenant_uid] = t.name;
        });
        return map;
    }, [tenants]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/owner/notices/create', {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEditOpen = (notice: Notice) => {
        setSelectedNotice(notice);
        editForm.setData({
            id: String(notice.id),
            title: notice.title,
            notice_details: notice.notice_details,
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put('/owner/notices/update', {
            onSuccess: () => {
                setShowEditModal(false);
                editForm.reset();
                setSelectedNotice(null);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedNotice) return;
        
        router.post('/owner/notices/delete', {
            _method: 'DELETE',
            id: selectedNotice.id
        }, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedNotice(null);
            }
        });
    };

    // Columns config for SearchableTable
    const columns = [
        {
            header: 'Notice UID',
            accessor: (row: Notice) => <span className="font-mono text-xs font-semibold">{row.notice_uid}</span>,
            sortable: true,
            sortKey: 'notice_uid' as keyof Notice,
        },
        {
            header: 'Recipient Tenant',
            accessor: (row: Notice) => (
                <div>
                    <p className="font-semibold text-foreground">{tenantNameMap[row.to_tenant_uid] || 'Unknown'}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{row.to_tenant_uid}</p>
                </div>
            ),
        },
        {
            header: 'Title',
            accessor: (row: Notice) => <span className="font-semibold text-foreground">{row.title}</span>,
            sortable: true,
            sortKey: 'title' as keyof Notice,
        },
        {
            header: 'Compliance Status',
            accessor: (row: Notice) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    row.is_complied 
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400'
                }`}>
                    {row.is_complied ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                    {row.is_complied ? 'Complied' : 'Pending'}
                </span>
            ),
        },
        {
            header: 'Issued Date',
            accessor: (row: Notice) =>
                new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sortable: true,
            sortKey: 'created_at' as keyof Notice,
        },
        {
            header: 'Actions',
            accessor: (row: Notice) => (
                <div className="flex items-center gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleEditOpen(row)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Tenant Notices" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tenant Notices & Broadcasts</h1>
                        <p className="text-muted-foreground text-sm">Issue and manage reminders for renting tenants</p>
                    </div>
                    <Button onClick={() => { createForm.reset(); setShowCreateModal(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Notice
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Notices Log */}
                    <div className="lg:col-span-2 bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                        <h3 className="font-bold text-lg text-foreground mb-4">Notice Registry</h3>
                        <SearchableTable
                            data={notices}
                            columns={columns}
                            searchKeys={['title', 'notice_uid', 'notice_details', 'to_tenant_uid']}
                            searchPlaceholder="Search notices log..."
                            rowsPerPage={10}
                        />
                    </div>

                    {/* Official Broadcasts */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 mb-2 dark:border-neutral-800">
                            <Megaphone className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Official Society Announcements</h2>
                        </div>
                        {announcements.length > 0 ? (
                            announcements.map((ann) => (
                                <div key={ann.id} className="bg-card rounded-xl border p-5 shadow-xs dark:border-neutral-800 flex gap-3">
                                    <div className="rounded-full bg-primary/10 text-primary p-2 h-fit shrink-0">
                                        <Megaphone className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{ann.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {ann.announcement_details}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground mt-2 block font-mono">
                                            {new Date(ann.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground text-sm dark:border-neutral-800">
                                No society announcements recorded.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Notice Modal */}
            <Dialog open={showCreateModal} onOpenChange={(v) => { if (!v) setShowCreateModal(false); }}>
                <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Newspaper className="h-5 w-5 text-primary" />
                            Issue Notice to Tenant
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="to_tenant_uid">
                                Recipient Tenant <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={createForm.data.to_tenant_uid}
                                onValueChange={(v) => createForm.setData('to_tenant_uid', v)}
                            >
                                <SelectTrigger id="to_tenant_uid">
                                    <SelectValue placeholder="Select renting tenant..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants.map((t) => (
                                        <SelectItem key={t.tenant_uid} value={t.tenant_uid}>
                                            {t.name} ({t.tenant_uid})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {createForm.errors.to_tenant_uid && <p className="text-xs text-destructive">{createForm.errors.to_tenant_uid}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Notice Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                required
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                placeholder="e.g. Utility payment reminder, Rent adjustment"
                            />
                            {createForm.errors.title && <p className="text-xs text-destructive">{createForm.errors.title}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notice_details">
                                Notice details <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="notice_details"
                                required
                                rows={5}
                                value={createForm.data.notice_details}
                                onChange={(e) => createForm.setData('notice_details', e.target.value)}
                                placeholder="Write notice details and compliance timeline..."
                                className="resize-none"
                            />
                            {createForm.errors.notice_details && <p className="text-xs text-destructive">{createForm.errors.notice_details}</p>}
                        </div>

                        <DialogFooter className="mt-4 gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Send Notice
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Notice Modal */}
            <Dialog open={showEditModal} onOpenChange={(v) => { if (!v) setShowEditModal(false); }}>
                <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Pencil className="h-5 w-5 text-primary" />
                            Update Notice details
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_title">
                                Notice Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit_title"
                                required
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                            />
                            {editForm.errors.title && <p className="text-xs text-destructive">{editForm.errors.title}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_notice_details">
                                Notice details <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="edit_notice_details"
                                required
                                rows={5}
                                value={editForm.data.notice_details}
                                onChange={(e) => editForm.setData('notice_details', e.target.value)}
                                className="resize-none"
                            />
                            {editForm.errors.notice_details && <p className="text-xs text-destructive">{editForm.errors.notice_details}</p>}
                        </div>

                        <DialogFooter className="mt-4 gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" onClick={() => setSelectedNotice(null)}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Notice Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Issued Notice</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
                            Are you sure you want to delete notice{' '}
                            <strong>{selectedNotice ? selectedNotice.notice_uid : ''}</strong> addressed to{' '}
                            <strong>{selectedNotice ? tenantNameMap[selectedNotice.to_tenant_uid] : ''}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedNotice(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                            onClick={handleDelete}
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
