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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Megaphone, Newspaper, CheckCircle2, Clock, LoaderCircle, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
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

const ANNOUNCEMENTS_PER_PAGE = 10;

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 pt-3 border-t border-border/50 dark:border-neutral-800">
            <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{startItem}–{endItem}</span> of{' '}
                <span className="font-medium text-foreground">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {getPageNumbers().map((page, idx) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-xs select-none">…</span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="icon"
                            className="h-7 w-7 text-xs"
                            onClick={() => onPageChange(page)}
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </Button>
                    )
                )}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

export default function OwnerNotices({ notices, tenants, announcements }: NoticesProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [announcementPage, setAnnouncementPage] = useState(1);

    const announcementTotalPages = Math.ceil(announcements.length / ANNOUNCEMENTS_PER_PAGE);

    const paginatedAnnouncements = announcements.slice(
        (announcementPage - 1) * ANNOUNCEMENTS_PER_PAGE,
        announcementPage * ANNOUNCEMENTS_PER_PAGE
    );

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
        tenants.forEach((t) => { map[t.tenant_uid] = t.name; });
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
        editForm.setData({ id: String(notice.id), title: notice.title, notice_details: notice.notice_details });
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
        router.post('/owner/notices/delete', { _method: 'DELETE', id: selectedNotice.id }, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedNotice(null);
            },
        });
    };

    const columns = [
        {
            header: 'Notice UID',
            accessor: (row: Notice) => <span className="font-mono text-xs font-semibold">{row.notice_uid}</span>,
            sortable: true,
            sortKey: 'notice_uid' as keyof Notice,
        },
        {
            header: 'Recipient',
            accessor: (row: Notice) => (
                <div>
                    <p className="font-semibold text-foreground text-sm">{tenantNameMap[row.to_tenant_uid] || 'Unknown'}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{row.to_tenant_uid}</p>
                </div>
            ),
        },
        {
            header: 'Title',
            accessor: (row: Notice) => <span className="font-semibold text-foreground text-sm">{row.title}</span>,
            sortable: true,
            sortKey: 'title' as keyof Notice,
        },
        {
            header: 'Status',
            accessor: (row: Notice) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
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
            header: 'Issued',
            accessor: (row: Notice) =>
                new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sortable: true,
            sortKey: 'created_at' as keyof Notice,
        },
        {
            header: 'Actions',
            className: 'text-end max-w-[100px]',
            accessor: (row: Notice) => (
                <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOpen(row)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => { setSelectedNotice(row); setShowDeleteDialog(true); }}
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

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <FlashMessage />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Tenant Notices & Broadcasts</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Issue and manage reminders for renting tenants</p>
                    </div>
                    <Button
                        onClick={() => { createForm.reset(); setShowCreateModal(true); }}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Notice
                    </Button>
                </div>

                <Tabs defaultValue="notices" className="w-full">
                    <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-16 mb-4 max-w-md">
                        <TabsTrigger value="notices" className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                            <span>Notice</span>
                            {notices.length > 0 && (
                                <span className="ml-1 bg-primary/15 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                    {notices.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <Megaphone className="h-3.5 w-3.5 shrink-0" />
                            <span>Announcements</span>
                            {announcements.length > 0 && (
                                <span className="ml-1 bg-primary/15 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                    {announcements.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Notice Registry Tab */}
                    <TabsContent value="notices" className="mt-0">
                        <div className="bg-card rounded-xl border p-4 sm:p-6 shadow-xs dark:border-neutral-800">
                            <h3 className="font-bold text-base sm:text-lg text-foreground mb-4">All Issued Notices</h3>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="lg:min-w-[600px] px-4 sm:px-0">
                                    <SearchableTable
                                        data={notices}
                                        columns={columns}
                                        searchKeys={['title', 'notice_uid', 'notice_details', 'to_tenant_uid']}
                                        searchPlaceholder="Search notices log..."
                                        rowsPerPage={10}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Society Announcements Tab */}
                    <TabsContent value="announcements" className="mt-0 space-y-3">
                        {announcements.length > 0 ? (
                            <>
                                {paginatedAnnouncements.map((ann) => (
                                    <div key={ann.id} className="bg-card rounded-xl border p-4 sm:p-5 shadow-xs dark:border-neutral-800 flex gap-3">
                                        <div className="rounded-full bg-primary/10 text-primary p-2 h-fit shrink-0">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground">{ann.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {ann.announcement_details}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground mt-2 block font-mono">
                                                {new Date(ann.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <Pagination
                                    currentPage={announcementPage}
                                    totalPages={announcementTotalPages}
                                    onPageChange={(page) => {
                                        setAnnouncementPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    totalItems={announcements.length}
                                    itemsPerPage={ANNOUNCEMENTS_PER_PAGE}
                                />
                            </>
                        ) : (
                            <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground text-sm dark:border-neutral-800">
                                <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                No society announcements recorded.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Notice Modal */}
            <Dialog open={showCreateModal} onOpenChange={(v) => { if (!v) setShowCreateModal(false); }}>
                <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto dark:border-neutral-800">
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
                                Notice Details <span className="text-destructive">*</span>
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

                        <DialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={createForm.processing} className="w-full sm:w-auto">
                                {createForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Send Notice
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Notice Modal */}
            <Dialog open={showEditModal} onOpenChange={(v) => { if (!v) setShowEditModal(false); }}>
                <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Pencil className="h-5 w-5 text-primary" />
                            Update Notice Details
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
                                Notice Details <span className="text-destructive">*</span>
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

                        <DialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setSelectedNotice(null)}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editForm.processing} className="w-full sm:w-auto">
                                {editForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Notice Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Issued Notice</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
                            Are you sure you want to delete notice{' '}
                            <strong>{selectedNotice?.notice_uid}</strong> addressed to{' '}
                            <strong>{selectedNotice ? tenantNameMap[selectedNotice.to_tenant_uid] : ''}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
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