import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Bell,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    Megaphone,
    Pencil,
    Plus,
    Search,
    Trash2,
    User,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Society Announcement',
        href: '/society-announcement',
    },
];

const ITEMS_PER_PAGE = 10;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Announcement {
    id: number;
    person_type: string;
    announcement_for_uid: string | null;
    title: string;
    details: string;
    created_at: string;
    updated_at: string;
}

interface FlatOwner {
    owner_uid: string;
    name: string;
}

interface Tenant {
    tenant_uid: string;
    name: string;
}

interface Props {
    data: Announcement[];
    owners: FlatOwner[];
    tenants: Tenant[];
}

type SortField = keyof Announcement;
type SortDirection = 'asc' | 'desc' | null;

interface AnnouncementFormData {
    person_type: string;
    announcement_for_uid: string;
    title: string;
    details: string;
    [key: string]: string;
}

const emptyForm = (): AnnouncementFormData => ({
    person_type: '',
    announcement_for_uid: '',
    title: '',
    details: '',
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

const personTypeLabel = (type: string) => {
    switch (type) {
        case 'all':
            return 'Everyone';
        case 'all_owners':
            return 'All Owners';
        case 'all_tenants':
            return 'All Tenants';
        case 'owner':
            return 'Specific Owner';
        case 'tenant':
            return 'Specific Tenant';
        default:
            return type;
    }
};

const personTypeBadge = (type: string) => {
    switch (type) {
        case 'all':
            return 'bg-purple-100 text-purple-700';
        case 'all_owners':
            return 'bg-blue-100 text-blue-700';
        case 'all_tenants':
            return 'bg-green-100 text-green-700';
        case 'owner':
            return 'bg-sky-100 text-sky-700';
        case 'tenant':
            return 'bg-emerald-100 text-emerald-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SocietyAnnouncement({ data, owners, tenants }: Props) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const createForm = useForm<AnnouncementFormData>(emptyForm());
    const editForm = useForm<AnnouncementFormData>(emptyForm());

    // ── Filter & sort ──
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                a.details.toLowerCase().includes(q) ||
                personTypeLabel(a.person_type).toLowerCase().includes(q) ||
                (a.announcement_for_uid ?? '').toLowerCase().includes(q),
        );
    }, [data, search]);

    const sorted = useMemo(() => {
        if (!sortField || !sortDirection) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sortField] ?? '';
            const bv = b[sortField] ?? '';
            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDirection === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSort = (field: SortField) => {
        if (sortField !== field) {
            setSortField(field);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') setSortDirection('desc');
        else {
            setSortField(null);
            setSortDirection(null);
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronsUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
        if (sortDirection === 'asc') return <ChevronUp className="ml-1 inline h-3 w-3" />;
        return <ChevronDown className="ml-1 inline h-3 w-3" />;
    };

    // ── CRUD ──
    const handleCreate = () => {
        createForm.post(route('society.announcement.create'), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEditOpen = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        editForm.setData({
            person_type: announcement.person_type,
            announcement_for_uid: announcement.announcement_for_uid ?? '',
            title: announcement.title,
            details: announcement.details,
        });
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        router.put(
            route('society.announcement.update'),
            { ...editForm.data, id: selectedAnnouncement?.id },
            {
                onSuccess: () => setShowEditModal(false),
            },
        );
    };

    const handleDelete = () => {
        router.delete(route('society.announcement.delete'), {
            data: { id: selectedAnnouncement?.id },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedAnnouncement(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Society Announcements</h1>
                        <p className="text-muted-foreground text-sm">Broadcast notices to owners, tenants, or specific individuals</p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Announcement
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search by title, audience, UID…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('title')}>
                                    Title <SortIcon field="title" />
                                </TableHead>
                                <TableHead>Audience</TableHead>
                                <TableHead>Recipient UID</TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                                    Date <SortIcon field="created_at" />
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Megaphone className="h-8 w-8 opacity-30" />
                                            <p>No announcements found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((ann) => (
                                    <TableRow key={ann.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <p className="font-medium">{ann.title}</p>
                                                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{ann.details}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${personTypeBadge(ann.person_type)}`}>
                                                {personTypeLabel(ann.person_type)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-gray-500">
                                            {ann.announcement_for_uid ?? <span className="text-muted-foreground italic">—</span>}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(ann.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditOpen(ann)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setSelectedAnnouncement(ann);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Showing {sorted.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
                        {Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of {sorted.length} results
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${i}`} className="px-2">
                                        …
                                    </span>
                                ) : (
                                    <Button
                                        key={p}
                                        variant={currentPage === p ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setCurrentPage(p as number)}
                                    >
                                        {p}
                                    </Button>
                                ),
                            )}
                        <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <AnnouncementModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                }}
                title="New Announcement"
                formData={createForm.data}
                setData={createForm.setData}
                errors={createForm.errors}
                processing={createForm.processing}
                onSubmit={handleCreate}
                submitLabel="Publish"
                owners={owners}
                tenants={tenants}
            />

            {/* Edit Modal */}
            <AnnouncementModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Announcement"
                formData={editForm.data}
                setData={editForm.setData}
                errors={editForm.errors}
                processing={editForm.processing}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                owners={owners}
                tenants={tenants}
            />

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">Delete Announcement</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-400">
                            Are you sure you want to delete <strong>"{selectedAnnouncement?.title}"</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

// ─── Announcement Modal ────────────────────────────────────────────────────────

interface AnnouncementModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    formData: AnnouncementFormData;
    setData: (key: keyof AnnouncementFormData, value: string) => void;
    errors: Partial<Record<keyof AnnouncementFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    submitLabel: string;
    owners: FlatOwner[];
    tenants: Tenant[];
}

function AnnouncementModal({
    open,
    onClose,
    title,
    formData,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    owners,
    tenants,
}: AnnouncementModalProps) {
    const isSpecific = formData.person_type === 'owner' || formData.person_type === 'tenant';

    const audienceOptions = [
        { value: 'all', label: 'Everyone (Owners + Tenants)', icon: <Users className="h-4 w-4" /> },
        { value: 'all_owners', label: 'All Flat Owners', icon: <Building2 className="h-4 w-4" /> },
        { value: 'all_tenants', label: 'All Tenants', icon: <User className="h-4 w-4" /> },
        { value: 'owner', label: 'Specific Owner', icon: <Building2 className="h-4 w-4" /> },
        { value: 'tenant', label: 'Specific Tenant', icon: <User className="h-4 w-4" /> },
    ];

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Title */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="ann-title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="ann-title"
                            value={formData.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Water supply disruption on 30th May"
                        />
                        {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
                    </div>

                    {/* Details */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="ann-details">
                            Details <span className="text-destructive">*</span>
                        </Label>
                        <textarea
                            id="ann-details"
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={formData.details}
                            onChange={(e) => setData('details', e.target.value)}
                            placeholder="Write the full announcement message here…"
                        />
                        {errors.details && <p className="text-destructive text-xs">{errors.details}</p>}
                    </div>

                    {/* Audience */}
                    <div className="grid gap-1.5">
                        <Label>
                            Audience <span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {audienceOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setData('person_type', opt.value);
                                        setData('announcement_for_uid', '');
                                    }}
                                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                        formData.person_type === opt.value
                                            ? 'border-primary bg-primary/5 text-primary font-medium'
                                            : 'border-input hover:bg-accent'
                                    }`}
                                >
                                    {opt.icon}
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        {errors.person_type && <p className="text-destructive text-xs">{errors.person_type}</p>}
                    </div>

                    {/* Specific recipient */}
                    {isSpecific && (
                        <div className="grid gap-1.5">
                            <Label>
                                Select {formData.person_type === 'owner' ? 'Owner' : 'Tenant'} <span className="text-destructive">*</span>
                            </Label>
                            <Select value={formData.announcement_for_uid} onValueChange={(v) => setData('announcement_for_uid', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Choose a ${formData.person_type}…`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {formData.person_type === 'owner'
                                        ? owners.map((o) => (
                                              <SelectItem key={o.owner_uid} value={o.owner_uid}>
                                                  <span className="font-medium">{o.name}</span>{' '}
                                                  <span className="text-muted-foreground font-mono text-xs">· {o.owner_uid}</span>
                                              </SelectItem>
                                          ))
                                        : tenants.map((t) => (
                                              <SelectItem key={t.tenant_uid} value={t.tenant_uid}>
                                                  <span className="font-medium">{t.name}</span>{' '}
                                                  <span className="text-muted-foreground font-mono text-xs">· {t.tenant_uid}</span>
                                              </SelectItem>
                                          ))}
                                </SelectContent>
                            </Select>
                            {errors.announcement_for_uid && <p className="text-destructive text-xs">{errors.announcement_for_uid}</p>}
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
                        {processing ? 'Saving…' : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
