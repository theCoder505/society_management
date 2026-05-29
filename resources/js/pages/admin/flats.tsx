import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Plus,
    Pencil,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Upload,
} from 'lucide-react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Flats', href: '/flats' },
];

interface Flat {
    id: number;
    appartment_uid: string | null;
    flatID: string;
    owner_uid: string | null;
    flat_type: 'rented' | 'to_rent' | 'to_live';
    tenant_uid: string | null;
    flat_price: number;
    flat_size: number;
    flat_bhk: number;
    tot_bedrooms: number;
    tot_washrooms: number;
    tot_balconies: number;
    drawing_dyning_kitchen: 'all_together' | 'all_seperate' | 'seperate_kitchen' | 'seperate_drawing';
    flat_images: string;
    flat_3d_video: string | null;
    rent_price: number | null;
    bought_at: string | null;
    wifi: 'yes' | 'no';
    dish: 'yes' | 'no';
    gas: 'yes' | 'no';
    intercom: 'yes' | 'no';
    lift: 'yes' | 'no';
    note: string | null;
}

interface Apartment {
    id: number;
    appartment_uid: string;
    appartment_name: string;
}

interface Props {
    flats: Flat[];
    apartments: Apartment[];
}

type SortField = keyof Flat;
type SortDirection = 'asc' | 'desc' | null;

const ITEMS_PER_PAGE = 10;

interface CreateFormData {
    appartment_uid: string;
    flatID: string;
    owner_uid: string;
    flat_type: 'rented' | 'to_rent' | 'to_live';
    tenant_uid: string;
    flat_price: string;
    flat_size: string;
    flat_bhk: string;
    tot_bedrooms: string;
    tot_washrooms: string;
    tot_balconies: string;
    drawing_dyning_kitchen: 'all_together' | 'all_seperate' | 'seperate_kitchen' | 'seperate_drawing';
    flat_images: File[];
    flat_3d_video: string;
    rent_price: string;
    bought_at: string;
    wifi: 'yes' | 'no';
    dish: 'yes' | 'no';
    gas: 'yes' | 'no';
    intercom: 'yes' | 'no';
    lift: 'yes' | 'no';
    note: string;
}

interface EditFormData extends Omit<CreateFormData, 'flat_images'> {
    _method: 'PUT';
    appartment_uid: string;
    flatID: string;
    existing_images: string;
    flat_images: File[];
}

const generateUID = () => `FLT_${Math.floor(1111 + Math.random() * (9999 - 1111 + 1))}`;

const formatTimestamp = (value: string | null | undefined) => {
    if (!value) return '';
    const timestamp = Number(value);
    const date = Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp) : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

const emptyCreateForm = (): CreateFormData => ({
    appartment_uid: '',
    flatID: generateUID(),
    owner_uid: '',
    flat_type: 'to_rent',
    tenant_uid: '',
    flat_price: '',
    flat_size: '',
    flat_bhk: '',
    tot_bedrooms: '',
    tot_washrooms: '',
    tot_balconies: '',
    drawing_dyning_kitchen: 'all_together',
    flat_images: [],
    flat_3d_video: '',
    rent_price: '',
    bought_at: '',
    wifi: 'no',
    dish: 'no',
    gas: 'no',
    intercom: 'no',
    lift: 'no',
    note: '',
});

const emptyEditForm = (): EditFormData => ({
    _method: 'PUT',
    appartment_uid: '',
    flatID: '',
    owner_uid: '',
    flat_type: 'to_rent',
    tenant_uid: '',
    flat_price: '',
    flat_size: '',
    flat_bhk: '',
    tot_bedrooms: '',
    tot_washrooms: '',
    tot_balconies: '',
    drawing_dyning_kitchen: 'all_together',
    existing_images: '',
    flat_images: [],
    flat_3d_video: '',
    rent_price: '',
    bought_at: '',
    wifi: 'no',
    dish: 'no',
    gas: 'no',
    intercom: 'no',
    lift: 'no',
    note: '',
});

export default function Flats({ flats, apartments }: Props) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);

    const createForm = useForm<CreateFormData>(emptyCreateForm());
    const editForm = useForm<EditFormData>(emptyEditForm());

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return flats.filter(
            (f) =>
                f.flatID.toLowerCase().includes(q) ||
                f.flat_type.toLowerCase().includes(q) ||
                (f.owner_uid ?? '').toLowerCase().includes(q) ||
                (f.appartment_uid
                    ? (apartments.find(a => a.appartment_uid === f.appartment_uid)?.appartment_name ?? '').toLowerCase().includes(q)
                    : false),
        );
    }, [flats, apartments, search]);

    const sorted = useMemo(() => {
        if (!sortField || !sortDirection) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sortField];
            const bv = b[sortField];
            const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
            return sortDirection === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
    const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSort = (field: SortField) => {
        if (sortField !== field) {
            setSortField(field);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else {
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

    const handleCreate = () => {
        const formData = new FormData();
        Object.entries(createForm.data).forEach(([key, value]) => {
            if (key === 'flat_images') {
                (value as File[]).forEach((file, index) => {
                    formData.append(`flat_images[${index}]`, file);
                });
            } else {
                formData.append(key, value as string);
            }
        });

        router.post(route('flats.create'), formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                createForm.setData('flatID', generateUID());
            },
            forceFormData: true,
        });
    };

    const handleEditOpen = (flat: Flat) => {
        setSelectedFlat(flat);
        editForm.setData({
            _method: 'PUT',
            appartment_uid: flat.appartment_uid ?? '',
            flatID: flat.flatID,
            owner_uid: flat.owner_uid ?? '',
            flat_type: flat.flat_type,
            tenant_uid: flat.tenant_uid ?? '',
            flat_price: String(flat.flat_price),
            flat_size: String(flat.flat_size),
            flat_bhk: String(flat.flat_bhk),
            tot_bedrooms: String(flat.tot_bedrooms),
            tot_washrooms: String(flat.tot_washrooms),
            tot_balconies: String(flat.tot_balconies),
            drawing_dyning_kitchen: flat.drawing_dyning_kitchen,
            existing_images: flat.flat_images,
            flat_images: [],
            flat_3d_video: flat.flat_3d_video ?? '',
            rent_price: flat.rent_price != null ? String(flat.rent_price) : '',
            bought_at: formatTimestamp(flat.bought_at),
            wifi: flat.wifi,
            dish: flat.dish,
            gas: flat.gas,
            intercom: flat.intercom,
            lift: flat.lift,
            note: flat.note ?? '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        const formData = new FormData();
        Object.entries(editForm.data).forEach(([key, value]) => {
            if (key === 'flat_images') {
                (value as File[]).forEach((file, index) => {
                    formData.append(`flat_images[${index}]`, file);
                });
            } else {
                formData.append(key, value as string);
            }
        });

        router.post(route('flats.update'), formData, {
            onSuccess: () => {
                setShowEditModal(false);
            },
            forceFormData: true,
        });
    };

    const handleDeleteOpen = (flat: Flat) => {
        setSelectedFlat(flat);
        setShowDeleteDialog(true);
    };

    const handleDelete = () => {
        router.delete(route('flats.delete'), {
            data: { flatID: selectedFlat?.flatID },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedFlat(null);
            },
        });
    };

    const typeBadgeColor = (v: string) =>
        ({
            rented: 'bg-blue-100 text-blue-700',
            to_rent: 'bg-amber-100 text-amber-700',
            to_live: 'bg-green-100 text-green-700',
        }[v] ?? 'bg-gray-100 text-gray-700');

    const typeLabel = (v: string) =>
        ({ rented: 'Rented', to_rent: 'To Rent', to_live: 'To Live' }[v] ?? v);

    const amenityBadge = (v: 'yes' | 'no') =>
        v === 'yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Flats" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Flats</h1>
                        <p className="text-muted-foreground text-sm">Manage all flats belonging to the apartments</p>
                    </div>
                    <Button onClick={() => {
                        createForm.reset();
                        createForm.setData('flatID', generateUID());
                        setShowCreateModal(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Flat
                    </Button>
                </div>

                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search by flat ID, type, owner…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('flatID')}>
                                    Flat ID <SortIcon field="flatID" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('appartment_uid')}>
                                    Apartment <SortIcon field="appartment_uid" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('flat_type')}>
                                    Type <SortIcon field="flat_type" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('flat_size')}>
                                    Size (sqft) <SortIcon field="flat_size" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('flat_bhk')}>
                                    BHK <SortIcon field="flat_bhk" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('flat_price')}>
                                    Price <SortIcon field="flat_price" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort('rent_price')}>
                                    Rent <SortIcon field="rent_price" />
                                </TableHead>
                                <TableHead>Amenities</TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('drawing_dyning_kitchen')}>
                                    DDK <SortIcon field="drawing_dyning_kitchen" />
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-muted-foreground py-10 text-center">
                                        No flats found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((flat) => (
                                    <TableRow key={flat.id}>
                                        <TableCell className="font-mono text-xs">{flat.flatID}</TableCell>
                                        <TableCell className="text-sm">
                                            {flat.appartment_uid
                                                ? (apartments.find(a => a.appartment_uid === flat.appartment_uid)?.appartment_name ?? <span className="text-muted-foreground font-mono text-xs">{flat.appartment_uid}</span>)
                                                : <span className="text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColor(flat.flat_type)}`}>
                                                {typeLabel(flat.flat_type)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">{flat.flat_size}</TableCell>
                                        <TableCell className="text-right">{flat.flat_bhk}</TableCell>
                                        <TableCell className="text-right">৳{Number(flat.flat_price).toLocaleString('en-us')}</TableCell>
                                        <TableCell className="text-right">
                                            {flat.rent_price ? `৳${Number(flat.rent_price).toLocaleString('en-us')}` : <span className="text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {(['wifi', 'gas', 'lift', 'intercom', 'dish'] as const).map((key) => (
                                                    <span key={key} className={`rounded-full px-1.5 py-0.5 text-xs font-medium uppercase ${amenityBadge(flat[key])}`}>
                                                        {key}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-xs">
                                            {flat.drawing_dyning_kitchen.replace(/_/g, ' ')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditOpen(flat)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteOpen(flat)}
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
                                    <span key={`ellipsis-${i}`} className="px-2">…</span>
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
            <FlatModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                    createForm.setData('flatID', generateUID());
                }}
                title="Create Flat"
                form={createForm}
                onSubmit={handleCreate}
                submitLabel="Create"
                isCreate={true}
                apartments={apartments}
            />

            {/* Edit Modal */}
            <FlatModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Flat"
                form={editForm}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                isCreate={false}
                existingImages={selectedFlat?.flat_images?.split(',').filter((img) => img && img.trim() !== '') || []}
                apartments={apartments}
            />

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-red-50 border border-red-500">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">Delete Flat</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-400">
                            Are you sure you want to delete flat <strong>{selectedFlat?.flatID}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
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

// ─── Flat Modal ────────────────────────────────────────────────────────────────

interface FlatModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    form: any;
    onSubmit: () => void;
    submitLabel: string;
    isCreate: boolean;
    existingImages?: string[];
    apartments: Apartment[];
}

function FlatModal({ open, onClose, title, form, onSubmit, submitLabel, isCreate, existingImages = [], apartments }: FlatModalProps) {
    const { data, setData, errors, processing } = form;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<{ file: File; preview: string }[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>(existingImages);

    useEffect(() => {
        if (!isCreate && existingImages.length > 0) {
            setExistingImageUrls(existingImages);
        }
    }, [existingImages, isCreate]);

    useEffect(() => {
        if (!open) {
            imagePreviews.forEach((p) => URL.revokeObjectURL(p.preview));
            setImagePreviews([]);
            if (!isCreate) setExistingImageUrls([]);
        }
    }, [open, isCreate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const newPreviews = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
        const allFiles = [...imagePreviews.map((p) => p.file), ...files];
        setData('flat_images', allFiles);
    };

    const removeNewImage = (index: number) => {
        const next = [...imagePreviews];
        URL.revokeObjectURL(next[index].preview);
        next.splice(index, 1);
        setImagePreviews(next);
        setData('flat_images', next.map((p) => p.file));
    };

    const removeExistingImage = (index: number) => {
        const updated = [...existingImageUrls];
        updated.splice(index, 1);
        setExistingImageUrls(updated);
        setData('existing_images', updated.join(','));
    };

    const field = (name: keyof any, label: string, type = 'text', required = false, readOnly = false) => (
        <div className="grid gap-1.5 w-full">
            <Label htmlFor={name as string}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Input
                id={name as string}
                type={type}
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full ${readOnly ? 'bg-muted cursor-not-allowed opacity-70' : ''}`}
            />
            {errors[name as string] && <p className="text-destructive text-xs">{errors[name as string]}</p>}
        </div>
    );

    const selectField = (
        name: keyof any,
        label: string,
        options: { value: string; label: string }[],
        required = false,
    ) => (
        <div className="grid gap-1.5 w-full">
            <Label>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Select value={data[name]} onValueChange={(v) => setData(name, v)}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errors[name as string] && <p className="text-destructive text-xs">{errors[name as string]}</p>}
        </div>
    );

    const yesNoOptions = [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
    ];

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-y-auto lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
                    {/* IDs */}
                    {field('flatID', 'Flat ID', 'text', true, !isCreate)}

                    {/* Apartment selector */}
                    <div className="grid gap-1.5">
                        <Label>
                            Apartment <span className="text-destructive">*</span>
                        </Label>
                        <Select value={data.appartment_uid} onValueChange={(v) => setData('appartment_uid', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select apartment…" />
                            </SelectTrigger>
                            <SelectContent>
                                {apartments.map((a) => (
                                    <SelectItem key={a.appartment_uid} value={a.appartment_uid}>
                                        {a.appartment_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.appartment_uid && <p className="text-destructive text-xs">{errors.appartment_uid}</p>}
                    </div>

                    {field('owner_uid', 'Owner UID', 'text', false, true)}
                    {field('tenant_uid', 'Tenant UID')}

                    {/* Pricing */}
                    {field('flat_price', 'Flat Price (৳)', 'number', true)}
                    {field('rent_price', 'Rent Price (৳)', 'number')}
                    {field('bought_at', 'Bought At', 'text', false, true)}

                    {/* Dimensions */}
                    {field('flat_size', 'Flat Size (sqft)', 'number', true)}
                    {field('flat_bhk', 'BHK', 'number', true)}
                    {field('tot_bedrooms', 'Total Bedrooms', 'number', true)}
                    {field('tot_washrooms', 'Total Washrooms', 'number', true)}
                    {field('tot_balconies', 'Total Balconies', 'number', true)}

                    {/* Layout */}
                    {selectField('drawing_dyning_kitchen', 'Drawing/Dining/Kitchen', [
                        { value: 'all_together', label: 'Combined' },
                        { value: 'all_seperate', label: 'Seperate' },
                        { value: 'seperate_kitchen', label: 'Seperate Kitchen' },
                        { value: 'seperate_drawing', label: 'Seperate Drawing' },
                    ], true)}

                    {/* Amenities */}
                    {selectField('wifi', 'WiFi', yesNoOptions, true)}
                    {selectField('dish', 'Dish/Cable', yesNoOptions, true)}
                    {selectField('gas', 'Gas', yesNoOptions, true)}
                    {selectField('intercom', 'Intercom', yesNoOptions, true)}
                    {selectField('lift', 'Lift', yesNoOptions, true)}

                    {/* 3D Video */}
                    <div className="sm:col-span-2">
                        {field('flat_3d_video', '3D Video URL')}
                    </div>

                    {/* Image Upload */}
                    <div className="sm:col-span-2">
                        <div className="grid gap-1.5">
                            <Label>Flat Images</Label>

                            {!isCreate && existingImageUrls.length > 0 && (
                                <div className="mb-4">
                                    <Label className="text-sm text-muted-foreground mb-2 block">Current Images</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {existingImageUrls.map((url, idx) => (
                                            <div key={`existing-${idx}`} className="relative h-24 w-24 overflow-hidden rounded-md border group">
                                                <img
                                                    src={url}
                                                    alt={`Existing ${idx + 1}`}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="bg-destructive absolute top-1 right-1 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeExistingImage(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {imagePreviews.length > 0 && (
                                <div className="mb-4">
                                    <Label className="text-sm text-muted-foreground mb-2 block">New Images</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={`new-${idx}`} className="relative h-24 w-24 overflow-hidden rounded-md border group">
                                                <img
                                                    src={preview.preview}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    className="bg-destructive absolute top-1 right-1 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeNewImage(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div
                                className="border-input hover:bg-accent flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="text-muted-foreground h-8 w-8" />
                                <p className="text-muted-foreground text-sm">Click to upload images</p>
                                <p className="text-muted-foreground text-xs">PNG, JPG, GIF, WEBP up to 5MB each</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {errors.flat_images && <p className="text-destructive text-xs">{errors.flat_images}</p>}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="note">Notes</Label>
                            <textarea
                                id="note"
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                value={data.note ?? ''}
                                onChange={(e) => setData('note', e.target.value)}
                            />
                            {errors.note && <p className="text-destructive text-xs">{errors.note}</p>}
                        </div>
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