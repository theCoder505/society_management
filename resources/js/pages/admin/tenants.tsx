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
    Users,
    X,
} from 'lucide-react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tenants', href: '/tenants' }];

const ITEMS_PER_PAGE = 10;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Tenant {
    id: number;
    tenant_uid: string;
    name: string;
    image: string | null;
    nid_front: string;
    nid_back: string;
    hometown: string;
    permanent_addr: string;
    contact: string;
    email: string;
    renting_flats: string[] | null;
    starting_rent_amount: Record<string, number> | null;
    current_rent_amount: Record<string, number> | null;
    family_members: number | null;
    renting_since: string | null;
    notes: string | null;
}

interface Apartment {
    appartment_uid: string;
    appartment_name: string;
}

interface FlatItem {
    flatID: string;
    appartment_uid: string | null;
    tenant_uid: string | null;
    rent_price: number | null;
}

interface Props {
    tenants: Tenant[];
    apartments: Apartment[];
    flats: FlatItem[];
}

type SortField = keyof Tenant;
type SortDirection = 'asc' | 'desc' | null;

// ─── Form shape ────────────────────────────────────────────────────────────────

interface TenantFormData {
    tenant_uid: string;
    name: string;
    image: File | null;
    nid_front: File | null;
    nid_back: File | null;
    hometown: string;
    permanent_addr: string;
    contact: string;
    email: string;
    renting_flats: string;
    current_rent_amount: string;
    family_members: string;
    renting_since: string;
    notes: string;
    appartments: string;
    [key: string]: string | File | null;
}

const emptyForm = (): TenantFormData => ({
    tenant_uid: '',
    name: '',
    image: null,
    nid_front: null,
    nid_back: null,
    hometown: '',
    permanent_addr: '',
    contact: '',
    email: '',
    renting_flats: '',
    current_rent_amount: '',
    family_members: '',
    renting_since: '',
    notes: '',
    appartments: '',
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

const flatCount = (t: Tenant): number => {
    if (!t.renting_flats) return 0;
    if (Array.isArray(t.renting_flats)) return t.renting_flats.length;
    try {
        const p = JSON.parse(t.renting_flats as unknown as string);
        return Array.isArray(p) ? p.length : 0;
    } catch {
        return (t.renting_flats as unknown as string).split(',').filter(Boolean).length;
    }
};

const flatList = (t: Tenant): string[] => {
    if (!t.renting_flats) return [];
    if (Array.isArray(t.renting_flats)) return t.renting_flats;
    try {
        const p = JSON.parse(t.renting_flats as unknown as string);
        return Array.isArray(p) ? p : [];
    } catch {
        return (t.renting_flats as unknown as string).split(',').filter(Boolean);
    }
};

/**
 * Normalise current_rent_amount from any format to Record<string, string>.
 * Handles:
 *   - Plain JS object (from Inertia/Laravel cast): { FLT_2A: 13500 }
 *   - JSON string: '{"FLT_2A":13500}'
 *   - Colon-pair string (in-flight form state): 'FLT_2A:13500,FLT_2B:9000'
 *   - Empty / null
 */
const parseRentMap = (raw: string | Record<string, number> | null | undefined): Record<string, string> => {
    if (!raw) return {};

    // Already a plain object (from Laravel cast)
    if (typeof raw === 'object' && !Array.isArray(raw)) {
        return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]));
    }

    // Try JSON
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)]));
            }
        } catch {
            // not valid JSON – fall through to colon-pair CSV
        }

        // Colon-pair CSV: "FLT_2A:13500,FLT_2B:9000"
        const result: Record<string, string> = {};
        raw.split(',').forEach((pair) => {
            const colonIdx = pair.indexOf(':');
            if (colonIdx === -1) return;
            const k = pair.slice(0, colonIdx).trim();
            const v = pair.slice(colonIdx + 1).trim();
            if (k && v) result[k] = v;
        });
        return result;
    }

    return {};
};

/** Serialise a rent map back to the colon-pair CSV format used in form state */
const serialiseRentMap = (map: Record<string, string>): string =>
    Object.entries(map)
        .filter(([_, v]) => v !== '' && v !== undefined) // Only include entries with values
        .map(([k, v]) => `${k}:${v}`)
        .join(',');

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Tenants({ tenants, apartments, flats }: Props) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    // initialAptUID is passed directly to the modal so it can seed its internal
    // selectedAptUID state synchronously – avoids the useEffect timing race.
    const [initialAptUID, setInitialAptUID] = useState<string>('');

    const createForm = useForm<TenantFormData>(emptyForm());
    const editForm = useForm<TenantFormData>(emptyForm());

    // ── Filtering & sorting ──
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        const aptNameMap = Object.fromEntries(apartments.map((a) => [a.appartment_uid, a.appartment_name.toLowerCase()]));
        return tenants.filter((t) => {
            const aptUID = (t as unknown as Record<string, string>)['appartments'] ?? '';
            return (
                t.name.toLowerCase().includes(q) ||
                t.tenant_uid.toLowerCase().includes(q) ||
                t.email.toLowerCase().includes(q) ||
                t.contact.toLowerCase().includes(q) ||
                t.hometown.toLowerCase().includes(q) ||
                flatList(t).some((fid) => fid.toLowerCase().includes(q)) ||
                aptUID.toLowerCase().includes(q) ||
                (aptNameMap[aptUID] ?? '').includes(q)
            );
        });
    }, [tenants, apartments, search]);

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
        const fd = new FormData();
        Object.entries(createForm.data).forEach(([k, v]) => {
            if (v instanceof File) fd.append(k, v);
            else if (v !== null && v !== undefined) fd.append(k, v as string);
        });
        router.post(route('tenants.create'), fd, {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
            forceFormData: true,
        });
    };

    const handleEditOpen = (t: Tenant) => {
        setSelectedTenant(t);
        const ids = flatList(t);

        // Derive apartment UID from the first flat
        const firstFlat = ids[0] ? flats.find((f) => f.flatID === ids[0]) : null;
        const aptUID = firstFlat?.appartment_uid ?? '';

        // CRITICAL FIX: Properly extract current rent amounts from the tenant object
        // The tenant's current_rent_amount comes from Laravel as a Record<string, number>
        // We need to convert it to colon-pair CSV format for the form state
        let rentStr = '';
        if (t.current_rent_amount && typeof t.current_rent_amount === 'object') {
            // Convert the object to colon-pair format: "FLT_2A:13500,FLT_2B:9000"
            const entries = Object.entries(t.current_rent_amount);
            if (entries.length > 0) {
                rentStr = entries.map(([k, v]) => `${k}:${v}`).join(',');
            }
        }

        // renting_since comes from Laravel as "YYYY-MM-DD" (date cast, no time part).
        // Guard against both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" forms.
        const rentingSince = t.renting_since ? t.renting_since.split('T')[0] : '';

        editForm.setData({
            tenant_uid: t.tenant_uid,
            name: t.name,
            image: null,
            nid_front: null,
            nid_back: null,
            hometown: t.hometown,
            permanent_addr: t.permanent_addr,
            contact: t.contact,
            email: t.email,
            renting_flats: ids.join(','),
            current_rent_amount: rentStr,
            family_members: String(t.family_members ?? ''),
            renting_since: rentingSince,
            notes: t.notes ?? '',
            appartments: aptUID,
        });

        // Set initialAptUID BEFORE opening the modal so the modal's useState
        // initialiser receives the correct value without needing a useEffect.
        setInitialAptUID(aptUID);
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        const fd = new FormData();
        Object.entries(editForm.data).forEach(([k, v]) => {
            if (v instanceof File) fd.append(k, v);
            else if (v !== null && v !== undefined) fd.append(k, v as string);
        });
        router.post(route('tenants.update'), fd, {
            onSuccess: () => setShowEditModal(false),
            forceFormData: true,
        });
    };

    const handleDelete = () => {
        router.delete(route('tenants.delete'), {
            data: { tenant_uid: selectedTenant?.tenant_uid },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedTenant(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenants" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
                        <p className="text-muted-foreground text-sm">Manage all registered tenants</p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Tenant
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search by name, UID, email, flat…"
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
                                <TableHead>Photo</TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('tenant_uid')}>
                                    Tenant UID <SortIcon field="tenant_uid" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                                    Name <SortIcon field="name" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>
                                    Email <SortIcon field="email" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('contact')}>
                                    Contact <SortIcon field="contact" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('renting_since')}>
                                    Since <SortIcon field="renting_since" />
                                </TableHead>
                                <TableHead>Family</TableHead>
                                <TableHead className="text-right">Flats</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-muted-foreground py-10 text-center">
                                        No tenants found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            {t.image ? (
                                                <img
                                                    src={t.image}
                                                    alt={t.name}
                                                    className="h-9 w-9 rounded-full border object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full border">
                                                    <User className="text-muted-foreground h-4 w-4" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{t.tenant_uid}</TableCell>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell className="text-sm text-blue-500 hover:text-blue-400">
                                            <a href={`mailto:${t.email}`}>{t.email}</a>
                                        </TableCell>
                                        <TableCell>{t.contact}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {t.renting_since ? new Date(t.renting_since).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {t.family_members != null ? (
                                                <span className="flex items-center gap-1 text-sm">
                                                    <Users className="text-muted-foreground h-3.5 w-3.5" />
                                                    {t.family_members}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    {flatCount(t)} flat{flatCount(t) !== 1 ? 's' : ''}
                                                </span>
                                                {t.current_rent_amount &&
                                                    typeof t.current_rent_amount === 'object' &&
                                                    Object.entries(t.current_rent_amount).map(([fid, amt]) => (
                                                        <span key={fid} className="text-muted-foreground text-xs">
                                                            {fid}: ৳{Number(amt).toLocaleString()}
                                                        </span>
                                                    ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditOpen(t)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setSelectedTenant(t);
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
            <TenantModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                }}
                title="Create Tenant"
                formData={createForm.data}
                setData={createForm.setData}
                errors={createForm.errors}
                processing={createForm.processing}
                onSubmit={handleCreate}
                submitLabel="Create"
                isCreate={true}
                existingTenant={null}
                apartments={apartments}
                allFlats={flats}
                initialAptUID=""
            />

            {/* Edit Modal */}
            <TenantModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setInitialAptUID('');
                }}
                title="Edit Tenant"
                formData={editForm.data}
                setData={editForm.setData}
                errors={editForm.errors}
                processing={editForm.processing}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                isCreate={false}
                existingTenant={selectedTenant}
                apartments={apartments}
                allFlats={flats}
                initialAptUID={initialAptUID}
            />

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">Delete Tenant</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-400">
                            Are you sure you want to delete <strong>{selectedTenant?.name}</strong>? This will also remove their NID documents and
                            unassign all their flats. This action cannot be undone.
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

// ─── Tenant Modal ──────────────────────────────────────────────────────────────

interface TenantModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    formData: TenantFormData;
    setData: (key: keyof TenantFormData, value: string | File | null) => void;
    errors: Partial<Record<keyof TenantFormData, string>>;
    processing: boolean;
    onSubmit: () => void;
    submitLabel: string;
    isCreate: boolean;
    existingTenant: Tenant | null;
    apartments: Apartment[];
    allFlats: FlatItem[];
    /** Passed from parent so the modal seeds its apt state synchronously. */
    initialAptUID: string;
}

function TenantModal({
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
    existingTenant,
    apartments,
    allFlats,
    initialAptUID,
}: TenantModalProps) {
    const profileRef = useRef<HTMLInputElement | null>(null);
    const nidFrontRef = useRef<HTMLInputElement | null>(null);
    const nidBackRef = useRef<HTMLInputElement | null>(null);

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
    const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);

    const [aptSearch, setAptSearch] = useState('');
    const [aptDropdownOpen, setAptDropdownOpen] = useState(false);
    const aptDropdownRef = useRef<HTMLDivElement>(null);

    // ── KEY FIX: seed selectedAptUID directly from initialAptUID prop.
    // This is set by the parent BEFORE the modal opens, so the very first render
    // already has the correct value – no useEffect timing race.
    const [selectedAptUID, setSelectedAptUID] = useState<string>(initialAptUID);

    // Keep selectedAptUID in sync when the prop changes (e.g. opening a different
    // tenant's edit modal while the previous one was still mounted).
    useEffect(() => {
        setSelectedAptUID(initialAptUID);
    }, [initialAptUID]);

    // Reset local state when modal closes
    useEffect(() => {
        if (!open) {
            setAptSearch('');
            setAptDropdownOpen(false);
            // Revoke previews
            if (profilePreview) URL.revokeObjectURL(profilePreview);
            if (nidFrontPreview) URL.revokeObjectURL(nidFrontPreview);
            if (nidBackPreview) URL.revokeObjectURL(nidBackPreview);
            setProfilePreview(null);
            setNidFrontPreview(null);
            setNidBackPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Outside click closes apt dropdown
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (aptDropdownRef.current && !aptDropdownRef.current.contains(e.target as Node)) setAptDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Derived state ──

    const selectedFlatIDs = useMemo(() => {
        if (!formData.renting_flats) return new Set<string>();
        return new Set(
            formData.renting_flats
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
        );
    }, [formData.renting_flats]);

    const currentTenantUID = existingTenant?.tenant_uid ?? null;

    const availableFlatsForApt = useMemo(() => {
        if (!selectedAptUID) return [];
        return allFlats.filter(
            (f) => f.appartment_uid === selectedAptUID && (!f.tenant_uid || f.tenant_uid === currentTenantUID),
        );
    }, [allFlats, selectedAptUID, currentTenantUID]);

    const selectedFlatDetails = useMemo(
        () => [...selectedFlatIDs].map((id) => allFlats.find((f) => f.flatID === id)).filter(Boolean) as FlatItem[],
        [selectedFlatIDs, allFlats],
    );

    // ── CRITICAL FIX: use parseRentMap helper that handles both object and string formats ──
    const rentMap = useMemo<Record<string, string>>(
        () => parseRentMap(formData.current_rent_amount),
        [formData.current_rent_amount],
    );

    const updateRent = (flatID: string, amount: string) => {
        const next = { ...rentMap, [flatID]: amount };
        setData('current_rent_amount', serialiseRentMap(next));
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

    const handleAptSelect = (uid: string) => {
        setSelectedAptUID(uid);
        setAptDropdownOpen(false);
        setAptSearch('');
        setData('appartments', uid);
    };

    const toggleFlat = (flatID: string) => {
        const next = new Set(selectedFlatIDs);
        if (next.has(flatID)) {
            next.delete(flatID);
            const nextRent = { ...rentMap };
            delete nextRent[flatID];
            setData('current_rent_amount', serialiseRentMap(nextRent));
        } else {
            next.add(flatID);
            const flat = allFlats.find((f) => f.flatID === flatID);
            const nextRent = { ...rentMap };
            
            // FIX: Always set the rent amount when adding a flat
            // If there's an existing rent amount for this flat, keep it
            // Otherwise, use the flat's default rent_price, or leave empty
            if (!nextRent[flatID]) {
                if (flat?.rent_price) {
                    nextRent[flatID] = String(flat.rent_price);
                } else {
                    nextRent[flatID] = '';
                }
            }
            
            setData('current_rent_amount', serialiseRentMap(nextRent));
        }
        setData('renting_flats', [...next].join(','));
    };

    const removeFlat = (flatID: string) => {
        const next = new Set(selectedFlatIDs);
        next.delete(flatID);
        setData('renting_flats', [...next].join(','));
        const nextRent = { ...rentMap };
        delete nextRent[flatID];
        setData('current_rent_amount', serialiseRentMap(nextRent));
    };

    const handleImagePick = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: keyof TenantFormData,
        setPreview: (url: string | null) => void,
        currentPreview: string | null,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (currentPreview) URL.revokeObjectURL(currentPreview);
        setPreview(URL.createObjectURL(file));
        setData(fieldName, file);
    };

    const textField = (name: keyof TenantFormData, label: string, type = 'text', required = false) => (
        <div className="grid gap-1.5">
            <Label htmlFor={name as string}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Input id={name as string} type={type} value={(formData[name] as string) ?? ''} onChange={(e) => setData(name, e.target.value)} />
            {errors[name] && <p className="text-destructive text-xs">{errors[name]}</p>}
        </div>
    );

    const imageUploadField = (
        label: string,
        fieldName: keyof TenantFormData,
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
                    {textField('contact', 'Contact Number', 'tel', true)}
                    {textField('hometown', 'Hometown', 'text', true)}

                    {/* Permanent Address */}
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

                    {/* Tenancy details */}
                    {textField('renting_since', 'Renting Since', 'date')}
                    {textField('family_members', 'Family Members', 'number')}

                    {/* Notes */}
                    <div className="sm:col-span-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                value={(formData.notes as string) ?? ''}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any additional notes about the tenant…"
                            />
                        </div>
                    </div>

                    {/* ── Apartment + Flat Assignment ── */}
                    <div className="space-y-3 sm:col-span-2">
                        <p className="flex items-center gap-2 text-sm font-medium">
                            <Building2 className="h-4 w-4" /> Apartment &amp; Flat Assignment
                        </p>

                        {/* Searchable apartment dropdown */}
                        <div className="grid gap-1.5">
                            <Label>Select Apartment</Label>
                            <div className="relative" ref={aptDropdownRef}>
                                <button
                                    type="button"
                                    className="border-input bg-background focus:ring-ring flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
                                    onClick={() => setAptDropdownOpen((v) => !v)}
                                >
                                    <span className={selectedAptName ? '' : 'text-muted-foreground'}>
                                        {selectedAptName || 'Search and select an apartment…'}
                                    </span>
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </button>

                                {aptDropdownOpen && (
                                    <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border shadow-md">
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
                                                        className={`hover:bg-accent flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                                                            selectedAptUID === apt.appartment_uid ? 'bg-accent font-medium' : ''
                                                        }`}
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
                                    <span className="text-muted-foreground ml-2 text-xs font-normal">(only unoccupied flats shown)</span>
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
                                                    className={`flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                                        checked
                                                            ? 'border-primary bg-primary/5 text-primary font-medium'
                                                            : 'border-input hover:bg-accent'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        {checked ? (
                                                            <CheckSquare className="text-primary h-4 w-4 shrink-0" />
                                                        ) : (
                                                            <Square className="text-muted-foreground h-4 w-4 shrink-0" />
                                                        )}
                                                        <span className="font-mono text-xs">{flat.flatID}</span>
                                                    </span>
                                                    {flat.rent_price && (
                                                        <span className="text-muted-foreground pl-5 text-xs font-normal">
                                                            ৳{flat.rent_price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected flats + editable current rent */}
                        {selectedFlatIDs.size > 0 && (
                            <div className="grid gap-2">
                                <Label>Selected Flats &amp; Current Rent ({selectedFlatIDs.size})</Label>
                                <div className="divide-y rounded-md border">
                                    {selectedFlatDetails.map((flat) => (
                                        <div key={flat.flatID} className="flex items-center gap-3 px-3 py-2">
                                            <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700">
                                                {flat.flatID}
                                            </span>
                                            {flat.appartment_uid && (
                                                <span className="text-muted-foreground shrink-0 text-xs">· {flat.appartment_uid}</span>
                                            )}
                                            <div className="ml-auto flex items-center gap-1.5">
                                                <span className="text-muted-foreground shrink-0 text-xs">৳</span>
                                                <Input
                                                    type="number"
                                                    className="h-7 w-28 text-xs"
                                                    placeholder="Current rent"
                                                    value={rentMap[flat.flatID] ?? ''}
                                                    onChange={(e) => updateRent(flat.flatID, e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFlat(flat.flatID)}
                                                    className="rounded-full p-1 transition-colors hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.current_rent_amount && <p className="text-destructive text-xs">{errors.current_rent_amount}</p>}
                            </div>
                        )}

                        {errors.renting_flats && <p className="text-destructive text-xs">{errors.renting_flats}</p>}
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
                                existingTenant?.image,
                                false,
                                <User className="text-muted-foreground h-8 w-8" />,
                            )}
                            {imageUploadField(
                                'NID Front Page',
                                'nid_front',
                                nidFrontRef,
                                nidFrontPreview,
                                setNidFrontPreview,
                                existingTenant?.nid_front,
                                isCreate,
                                <IdCard className="text-muted-foreground h-8 w-8" />,
                            )}
                            {imageUploadField(
                                'NID Back Page',
                                'nid_back',
                                nidBackRef,
                                nidBackPreview,
                                setNidBackPreview,
                                existingTenant?.nid_back,
                                isCreate,
                                <IdCard className="text-muted-foreground h-8 w-8" />,
                            )}
                        </div>
                    </div>

                    {/* Admin notice */}
                    <div className="sm:col-span-2">
                        <p className="text-muted-foreground bg-muted rounded-md border px-3 py-2 text-xs">
                            🔒 Password and OTP are not managed here — they are set by the tenant through the resident portal.
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