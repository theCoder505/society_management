import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Building2,
    CheckSquare,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    IdCard,
    Pencil,
    Plus,
    Search,
    Square,
    Trash2,
    Upload,
    User,
    X,
} from 'lucide-react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Flat Owners', href: '/flat-owners' }];

const ITEMS_PER_PAGE = 10;

const generateOwnerUID = () => `OWN_${Math.floor(1000 + Math.random() * 9000)}`;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FlatOwner {
    id: number;
    owner_uid: string;
    name: string;
    image: string | null;
    nid_front_page: string;
    nid_back_page: string;
    hometown: string;
    permanent_addr: string;
    contact_number: string;
    email: string;
    appartments: string | null;
    flats: string | null;
}

interface Apartment {
    appartment_uid: string;
    appartment_name: string;
}

interface FlatItem {
    flatID: string;
    appartment_uid: string | null;
    owner_uid: string | null;
}

interface Props {
    owners: FlatOwner[];
    apartments: Apartment[];
    flats: FlatItem[];
}

type SortField = keyof FlatOwner;
type SortDirection = 'asc' | 'desc' | null;

// ─── Form shapes ───────────────────────────────────────────────────────────────

interface OwnerFormData {
    owner_uid: string;
    name: string;
    image: File | null;
    nid_front_page: File | null;
    nid_back_page: File | null;
    hometown: string;
    permanent_addr: string;
    contact_number: string;
    email: string;
    appartments: string;
    flats: string;
    [key: string]: string | File | null;
}

const emptyCreate = (): OwnerFormData => ({
    owner_uid: generateOwnerUID(),
    name: '',
    image: null,
    nid_front_page: null,
    nid_back_page: null,
    hometown: '',
    permanent_addr: '',
    contact_number: '',
    email: '',
    appartments: '',
    flats: '',
});

const emptyEdit = (): OwnerFormData => ({
    owner_uid: '',
    name: '',
    image: null,
    nid_front_page: null,
    nid_back_page: null,
    hometown: '',
    permanent_addr: '',
    contact_number: '',
    email: '',
    appartments: '',
    flats: '',
});

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FlatOwners({ owners, apartments, flats }: Props) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<FlatOwner | null>(null);

    const createForm = useForm<OwnerFormData>(emptyCreate());
    const editForm = useForm<OwnerFormData>(emptyEdit());

    // ── Filtering & sorting ──
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        // Build a quick UID→name lookup
        const aptNameMap = Object.fromEntries(apartments.map((a) => [a.appartment_uid, a.appartment_name.toLowerCase()]));
        return owners.filter(
            (o) =>
                (o.appartments ?? '').toLowerCase().includes(q) ||
                aptNameMap[o.appartments ?? '']?.includes(q) || // ← match by name
                o.name.toLowerCase().includes(q) ||
                o.owner_uid.toLowerCase().includes(q) ||
                o.email.toLowerCase().includes(q) ||
                o.contact_number.toLowerCase().includes(q),
        );
    }, [owners, apartments, search]);

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

    // ── CRUD handlers ──
    const handleCreate = () => {
        const formData = new FormData();
        Object.entries(createForm.data).forEach(([key, value]) => {
            if (value instanceof File) formData.append(key, value);
            else if (value !== null && value !== undefined) formData.append(key, value as string);
        });
        router.post(route('flat_owners.create'), formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                createForm.setData('owner_uid', generateOwnerUID());
            },
            forceFormData: true,
        });
    };

    const handleEditOpen = (owner: FlatOwner) => {
        setSelectedOwner(owner);
        editForm.setData({
            owner_uid: owner.owner_uid,
            name: owner.name,
            image: null,
            nid_front_page: null,
            nid_back_page: null,
            hometown: owner.hometown,
            permanent_addr: owner.permanent_addr,
            contact_number: owner.contact_number,
            email: owner.email,
            appartments: owner.appartments ?? '',
            flats: owner.flats ?? '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        const formData = new FormData();
        Object.entries(editForm.data).forEach(([key, value]) => {
            if (value instanceof File) formData.append(key, value);
            else if (value !== null && value !== undefined) formData.append(key, value as string);
        });
        router.post(route('flat_owners.update'), formData, {
            onSuccess: () => setShowEditModal(false),
            forceFormData: true,
        });
    };

    const handleDelete = () => {
        router.delete(route('flat_owners.delete'), {
            data: { owner_uid: selectedOwner?.owner_uid },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedOwner(null);
            },
        });
    };

    const ownerFlatCount = (owner: FlatOwner): number => {
        if (!owner.flats) return 0;
        try {
            const parsed: unknown = JSON.parse(owner.flats);
            return Array.isArray(parsed) ? parsed.length : owner.flats.split(',').filter(Boolean).length;
        } catch {
            return owner.flats.split(',').filter(Boolean).length;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Flat Owners</h1>
                        <p className="text-muted-foreground text-sm">Manage all registered flat owners</p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            createForm.setData('owner_uid', generateOwnerUID());
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Owner
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search by Apartment, name, UID, email…"
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
                                <TableHead>Apartment</TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('owner_uid')}>
                                    Owner UID <SortIcon field="owner_uid" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                                    Name <SortIcon field="name" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>
                                    Email <SortIcon field="email" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('contact_number')}>
                                    Contact <SortIcon field="contact_number" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('hometown')}>
                                    Hometown <SortIcon field="hometown" />
                                </TableHead>
                                <TableHead className="text-right">Flats</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                                        No flat owners found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((owner) => (
                                    <TableRow key={owner.id}>
                                        <TableCell>{owner.appartments}</TableCell>
                                        <TableCell className="font-mono text-xs">{owner.owner_uid}</TableCell>
                                        <TableCell className="font-medium">{owner.name}</TableCell>
                                        <TableCell className="text-sm text-blue-500 hover:text-blue-400">
                                            <a href={`mailto:${owner.email}`}>{owner.email}</a>
                                        </TableCell>
                                        <TableCell>{owner.contact_number}</TableCell>
                                        <TableCell className="text-muted-foreground">{owner.hometown}</TableCell>
                                        <TableCell className="text-right">
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                {ownerFlatCount(owner)} flat{ownerFlatCount(owner) !== 1 ? 's' : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditOpen(owner)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setSelectedOwner(owner);
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
            <OwnerModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                    createForm.setData('owner_uid', generateOwnerUID());
                }}
                title="Create Flat Owner"
                formData={createForm.data}
                setData={createForm.setData}
                errors={createForm.errors}
                processing={createForm.processing}
                onSubmit={handleCreate}
                submitLabel="Create"
                isCreate={true}
                existingOwner={null}
                apartments={apartments}
                allFlats={flats}
            />

            {/* Edit Modal */}
            <OwnerModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Flat Owner"
                formData={editForm.data}
                setData={editForm.setData}
                errors={editForm.errors}
                processing={editForm.processing}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                isCreate={false}
                existingOwner={selectedOwner}
                apartments={apartments}
                allFlats={flats}
            />

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">Delete Flat Owner</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-400">
                            Are you sure you want to delete <strong>{selectedOwner?.name}</strong>? This will also remove their NID documents. This
                            action cannot be undone.
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

// ─── Owner Modal ───────────────────────────────────────────────────────────────

interface OwnerModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    formData: OwnerFormData;
    setData: (key: keyof OwnerFormData, value: string | File | null) => void;
    errors: Partial<Record<keyof OwnerFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    submitLabel: string;
    isCreate: boolean;
    existingOwner: FlatOwner | null;
    apartments: Apartment[];
    allFlats: FlatItem[];
}

function OwnerModal({
    open,
    onClose,
    title,
    formData,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    isCreate,
    existingOwner,
    apartments,
    allFlats,
}: OwnerModalProps) {
    const profileRef = useRef<HTMLInputElement | null>(null);
    const nidFrontRef = useRef<HTMLInputElement | null>(null);
    const nidBackRef = useRef<HTMLInputElement | null>(null);

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
    const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);

    // Apartment selector state
    const [aptSearch, setAptSearch] = useState('');
    const [aptDropdownOpen, setAptDropdownOpen] = useState(false);
    const aptDropdownRef = useRef<HTMLDivElement>(null);

    // Currently selected apartment UID (local UI state, separate from formData.appartments)
    const [selectedAptUID, setSelectedAptUID] = useState<string>('');

    // Parse currently-selected flat IDs from formData
    const selectedFlatIDs = useMemo(() => {
        if (!formData.flats) return new Set<string>();
        return new Set(
            formData.flats
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
        );
    }, [formData.flats]);

    // When modal opens, pre-select the apartment if editing
    useEffect(() => {
        if (open && !isCreate && existingOwner?.appartments) {
            const firstApt = existingOwner.appartments.split(',')[0]?.trim();
            setSelectedAptUID(firstApt ?? '');
        }
        if (!open) {
            setSelectedAptUID('');
            setAptSearch('');
        }
    }, [open, isCreate, existingOwner]);

    // Close apt dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (aptDropdownRef.current && !aptDropdownRef.current.contains(e.target as Node)) {
                setAptDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!open) {
            if (profilePreview) URL.revokeObjectURL(profilePreview);
            if (nidFrontPreview) URL.revokeObjectURL(nidFrontPreview);
            if (nidBackPreview) URL.revokeObjectURL(nidBackPreview);
            setProfilePreview(null);
            setNidFrontPreview(null);
            setNidBackPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // ── Availability logic ──────────────────────────────────────────────────────
    // A flat is "available" if:
    //   - it has no owner_uid  OR
    //   - it is already owned by THIS owner (so editing doesn't block re-selecting own flats)
    const currentOwnerUID = existingOwner?.owner_uid ?? null;

    const availableFlatsForApt = useMemo(() => {
        if (!selectedAptUID) return [];
        return allFlats.filter((f) => f.appartment_uid === selectedAptUID && (!f.owner_uid || f.owner_uid === currentOwnerUID));
    }, [allFlats, selectedAptUID, currentOwnerUID]);

    // Flats that are already selected (from other apartments) – shown as tags
    const selectedFlatDetails = useMemo(() => {
        return [...selectedFlatIDs].map((id) => allFlats.find((f) => f.flatID === id)).filter(Boolean) as FlatItem[];
    }, [selectedFlatIDs, allFlats]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleAptSelect = (uid: string) => {
        setSelectedAptUID(uid);
        setAptDropdownOpen(false);
        setAptSearch('');
        // Update appartments field
        setData('appartments', uid);
    };

    const toggleFlat = (flatID: string) => {
        const next = new Set(selectedFlatIDs);
        if (next.has(flatID)) {
            next.delete(flatID);
        } else {
            next.add(flatID);
        }
        setData('flats', [...next].join(','));
    };

    const removeFlat = (flatID: string) => {
        const next = new Set(selectedFlatIDs);
        next.delete(flatID);
        setData('flats', [...next].join(','));
    };

    const filteredApartments = useMemo(
        () =>
            apartments.filter(
                (a) =>
                    a.appartment_name.toLowerCase().includes(aptSearch.toLowerCase()) ||
                    a.appartment_uid.toLowerCase().includes(aptSearch.toLowerCase()),
            ),
        [apartments, aptSearch],
    );

    const selectedAptName = apartments.find((a) => a.appartment_uid === selectedAptUID)?.appartment_name ?? '';

    // ── Image helpers ──────────────────────────────────────────────────────────

    const handleImagePick = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: keyof OwnerFormData,
        setPreview: (url: string | null) => void,
        currentPreview: string | null,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (currentPreview) URL.revokeObjectURL(currentPreview);
        setPreview(URL.createObjectURL(file));
        setData(fieldName, file);
    };

    const textField = (name: keyof OwnerFormData, label: string, type = 'text', required = false, readOnly = false) => (
        <div className="grid gap-1.5">
            <Label htmlFor={name as string}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Input
                id={name as string}
                type={type}
                value={(formData[name] as string) ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                readOnly={readOnly}
                className={readOnly ? 'bg-muted cursor-not-allowed opacity-70' : ''}
            />
            {errors[name] && <p className="text-destructive text-xs">{errors[name]}</p>}
        </div>
    );

    const imageUploadField = (
        label: string,
        fieldName: keyof OwnerFormData,
        inputRef: React.RefObject<HTMLInputElement | null>,
        preview: string | null,
        setPreview: (url: string | null) => void,
        existingUrl: string | null | undefined,
        required = false,
        icon: React.ReactNode = <Upload className="text-muted-foreground h-6 w-6" />,
    ) => {
        const displaySrc = preview ?? existingUrl ?? null;
        return (
            <div className="grid gap-1.5">
                <Label>
                    {label} {required && <span className="text-destructive">*</span>}
                </Label>
                <div
                    className="border-input hover:bg-accent relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed transition-colors"
                    style={{ minHeight: '110px' }}
                    onClick={() => inputRef.current?.click()}
                >
                    {displaySrc ? (
                        <>
                            <img src={displaySrc} alt={label} className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                <p className="text-xs font-medium text-white">Click to replace</p>
                            </div>
                        </>
                    ) : (
                        <>
                            {icon}
                            <p className="text-muted-foreground text-xs">Click to upload</p>
                        </>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => handleImagePick(e, fieldName, setPreview, preview)}
                />
                {errors[fieldName] && <p className="text-destructive text-xs">{errors[fieldName]}</p>}
            </div>
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-y-auto lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
                    {/* Identity */}
                    {textField('name', 'Full Name', 'text', true)}
                    {textField('email', 'Email', 'email', true)}
                    {textField('contact_number', 'Contact Number', 'tel', true)}
                    {textField('hometown', 'Hometown', 'text', true)}

                    {/* Permanent address */}
                    <div className="sm:col-span-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="permanent_addr">
                                Permanent Address <span className="text-destructive">*</span>
                            </Label>
                            <textarea
                                id="permanent_addr"
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                value={(formData.permanent_addr as string) ?? ''}
                                onChange={(e) => setData('permanent_addr', e.target.value)}
                            />
                            {errors.permanent_addr && <p className="text-destructive text-xs">{errors.permanent_addr}</p>}
                        </div>
                    </div>

                    {/* ── Apartment + Flat Assignment ── */}
                    <div className="space-y-3 sm:col-span-2">
                        <p className="flex items-center gap-2 text-sm font-medium">
                            <Building2 className="h-4 w-4" /> Apartment &amp; Flat Assignment
                        </p>

                        {/* Apartment searchable dropdown */}
                        <div className="grid gap-1.5">
                            <Label>Select Apartment</Label>
                            <div className="relative" ref={aptDropdownRef}>
                                <button
                                    type="button"
                                    className="border-input bg-background ring-offset-background focus:ring-ring flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
                                    onClick={() => setAptDropdownOpen((v) => !v)}
                                >
                                    <span className={selectedAptName ? '' : 'text-muted-foreground'}>
                                        {selectedAptName || 'Search and select an apartment…'}
                                    </span>
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </button>

                                {aptDropdownOpen && (
                                    <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border shadow-md">
                                        {/* Search inside dropdown */}
                                        <div className="flex items-center border-b px-3 py-2">
                                            <Search className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
                                            <input
                                                autoFocus
                                                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
                                                placeholder="Search apartments…"
                                                value={aptSearch}
                                                onChange={(e) => setAptSearch(e.target.value)}
                                            />
                                        </div>
                                        <ul className="max-h-48 overflow-y-auto py-1">
                                            {filteredApartments.length === 0 ? (
                                                <li className="text-muted-foreground px-3 py-2 text-sm">No apartments found.</li>
                                            ) : (
                                                filteredApartments.map((apt) => (
                                                    <li
                                                        key={apt.appartment_uid}
                                                        className={`hover:bg-accent flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${selectedAptUID === apt.appartment_uid ? 'bg-accent font-medium' : ''}`}
                                                        onClick={() => handleAptSelect(apt.appartment_uid)}
                                                    >
                                                        <span>{apt.appartment_name}</span>
                                                        <span className="text-muted-foreground font-mono text-xs">{apt.appartment_uid}</span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {errors.appartments && <p className="text-destructive text-xs">{errors.appartments}</p>}
                        </div>

                        {/* Flat checkboxes */}
                        {selectedAptUID && (
                            <div className="grid gap-1.5">
                                <Label>
                                    Available Flats
                                    <span className="text-muted-foreground ml-2 text-xs font-normal">(only unassigned flats shown)</span>
                                </Label>
                                {availableFlatsForApt.length === 0 ? (
                                    <div className="text-muted-foreground rounded-md border border-dashed px-4 py-6 text-center text-sm">
                                        No available flats in this apartment.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-3 md:grid-cols-4">
                                        {availableFlatsForApt.map((flat) => {
                                            const checked = selectedFlatIDs.has(flat.flatID);
                                            return (
                                                <button
                                                    key={flat.flatID}
                                                    type="button"
                                                    onClick={() => toggleFlat(flat.flatID)}
                                                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                                        checked
                                                            ? 'border-primary bg-primary/5 text-primary font-medium'
                                                            : 'border-input hover:bg-accent'
                                                    }`}
                                                >
                                                    {checked ? (
                                                        <CheckSquare className="text-primary h-4 w-4 shrink-0" />
                                                    ) : (
                                                        <Square className="text-muted-foreground h-4 w-4 shrink-0" />
                                                    )}
                                                    <span className="truncate font-mono text-xs">{flat.flatID}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected flats summary tags */}
                        {selectedFlatIDs.size > 0 && (
                            <div className="grid gap-1.5">
                                <Label>Selected Flats ({selectedFlatIDs.size})</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedFlatDetails.map((flat) => (
                                        <span
                                            key={flat.flatID}
                                            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                                        >
                                            {flat.flatID}
                                            {flat.appartment_uid && <span className="font-normal text-blue-400">· {flat.appartment_uid}</span>}
                                            <button
                                                type="button"
                                                onClick={() => removeFlat(flat.flatID)}
                                                className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {errors.flats && <p className="text-destructive text-xs">{errors.flats}</p>}
                    </div>

                    {/* Images */}
                    <div className="sm:col-span-2">
                        <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                            <IdCard className="h-4 w-4" /> Documents &amp; Photo
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {imageUploadField(
                                'Profile Photo',
                                'image',
                                profileRef,
                                profilePreview,
                                setProfilePreview,
                                existingOwner?.image,
                                false,
                                <User className="text-muted-foreground h-8 w-8" />,
                            )}
                            {imageUploadField(
                                'NID Front Page',
                                'nid_front_page',
                                nidFrontRef,
                                nidFrontPreview,
                                setNidFrontPreview,
                                existingOwner?.nid_front_page,
                                isCreate,
                                <IdCard className="text-muted-foreground h-8 w-8" />,
                            )}
                            {imageUploadField(
                                'NID Back Page',
                                'nid_back_page',
                                nidBackRef,
                                nidBackPreview,
                                setNidBackPreview,
                                existingOwner?.nid_back_page,
                                isCreate,
                                <IdCard className="text-muted-foreground h-8 w-8" />,
                            )}
                        </div>
                    </div>

                    {/* Admin notice */}
                    <div className="sm:col-span-2">
                        <p className="text-muted-foreground bg-muted rounded-md border px-3 py-2 text-xs">
                            🔒 Password and OTP are not managed here — they are set by the owner through the resident portal.
                        </p>
                    </div>
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
