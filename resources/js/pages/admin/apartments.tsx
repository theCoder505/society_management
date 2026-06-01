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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Apartments', href: '/apartments' }];

interface Apartment {
    id: number;
    appartment_uid: string;
    appartment_name: string;
    appartment_location: string;
    total_flats: number;
    total_units: number;
    total_lifts: number;
    doors_open_time: string;
    doors_close_time: string;
    total_gas_lines: number;
    gas_systen: 'lpg' | 'card' | 'manual' | 'other';
    water_systen: 'wasa' | 'submersible_pump' | 'normal_pump' | 'other';
    water_in_time: string | null;
    water_out_time: string | null;
    garage_location: 'no_garage' | 'ground_floor' | 'underground';
    garage_size: string | null;
    garage_allocation: string | null;
    garage_sections: string | null;
    total_electricity_lines: number;
    tot_solar_panels: number;
    terrace_option: 'open_for_all' | 'owners_only';
    apartment_images: string;
    apartment_notes: string | null;
}

interface Props {
    apartments: Apartment[];
}

type SortField = keyof Apartment;
type SortDirection = 'asc' | 'desc' | null;

const ITEMS_PER_PAGE = 10;

interface CreateFormData {
    appartment_uid: string;
    appartment_name: string;
    appartment_location: string;
    total_flats: string;
    total_units: string;
    total_lifts: string;
    doors_open_time: string;
    doors_close_time: string;
    total_gas_lines: string;
    gas_systen: 'lpg' | 'card' | 'manual' | 'other';
    water_systen: 'wasa' | 'submersible_pump' | 'normal_pump' | 'other';
    water_in_time: string;
    water_out_time: string;
    garage_location: 'no_garage' | 'ground_floor' | 'underground';
    garage_size: string;
    garage_allocation: string;
    garage_sections: string;
    total_electricity_lines: string;
    tot_solar_panels: string;
    terrace_option: 'open_for_all' | 'owners_only';
    apartment_images: File[];
    apartment_notes: string;
}

interface EditFormData extends Omit<CreateFormData, 'apartment_images'> {
    _method: 'PUT';
    appartment_uid: string;
    existing_images: string;
    apartment_images: File[];
}

const generateUID = () => `APT_${Math.floor(1111 + Math.random() * (9999 - 1111 + 1))}`;

const emptyCreateForm = (): CreateFormData => ({
    appartment_uid: generateUID(),
    appartment_name: '',
    appartment_location: '',
    total_flats: '',
    total_units: '',
    total_lifts: '',
    doors_open_time: '',
    doors_close_time: '',
    total_gas_lines: '',
    gas_systen: 'lpg',
    water_systen: 'wasa',
    water_in_time: '',
    water_out_time: '',
    garage_location: 'no_garage',
    garage_size: '',
    garage_allocation: '',
    garage_sections: '',
    total_electricity_lines: '',
    tot_solar_panels: '',
    terrace_option: 'open_for_all',
    apartment_images: [],
    apartment_notes: '',
});

const emptyEditForm = (): EditFormData => ({
    _method: 'PUT',
    appartment_uid: '',
    appartment_name: '',
    appartment_location: '',
    total_flats: '',
    total_units: '',
    total_lifts: '',
    doors_open_time: '',
    doors_close_time: '',
    total_gas_lines: '',
    gas_systen: 'lpg',
    water_systen: 'wasa',
    water_in_time: '',
    water_out_time: '',
    garage_location: 'no_garage',
    garage_size: '',
    garage_allocation: '',
    garage_sections: '',
    total_electricity_lines: '',
    tot_solar_panels: '',
    terrace_option: 'open_for_all',
    existing_images: '',
    apartment_images: [],
    apartment_notes: '',
});

export default function Apartments({ apartments }: Props) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

    const createForm = useForm<CreateFormData>(emptyCreateForm());
    const editForm = useForm<EditFormData>(emptyEditForm());

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return apartments.filter(
            (a) =>
                a.appartment_name.toLowerCase().includes(q) ||
                a.appartment_location.toLowerCase().includes(q) ||
                a.appartment_uid.toLowerCase().includes(q),
        );
    }, [apartments, search]);

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
        } else if (sortDirection === 'desc') {
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
            if (key === 'apartment_images') {
                (value as File[]).forEach((file, index) => {
                    formData.append(`apartment_images[${index}]`, file);
                });
            } else {
                formData.append(key, value as string);
            }
        });

        router.post(route('apartments.create'), formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
                createForm.setData('appartment_uid', generateUID());
            },
            forceFormData: true,
        });
    };

    const handleEditOpen = (apt: Apartment) => {
        setSelectedApartment(apt);
        editForm.setData({
            _method: 'PUT',
            appartment_uid: apt.appartment_uid,
            appartment_name: apt.appartment_name,
            appartment_location: apt.appartment_location,
            total_flats: String(apt.total_flats),
            total_units: String(apt.total_units),
            total_lifts: String(apt.total_lifts),
            doors_open_time: apt.doors_open_time,
            doors_close_time: apt.doors_close_time,
            total_gas_lines: String(apt.total_gas_lines),
            gas_systen: apt.gas_systen,
            water_systen: apt.water_systen,
            water_in_time: apt.water_in_time ?? '',
            water_out_time: apt.water_out_time ?? '',
            garage_location: apt.garage_location,
            garage_size: apt.garage_size ?? '',
            garage_allocation: apt.garage_allocation ?? '',
            garage_sections: apt.garage_sections ?? '',
            total_electricity_lines: String(apt.total_electricity_lines),
            tot_solar_panels: String(apt.tot_solar_panels),
            terrace_option: apt.terrace_option,
            existing_images: apt.apartment_images,
            apartment_images: [],
            apartment_notes: apt.apartment_notes ?? '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        const formData = new FormData();
        Object.entries(editForm.data).forEach(([key, value]) => {
            if (key === 'apartment_images') {
                (value as File[]).forEach((file, index) => {
                    formData.append(`apartment_images[${index}]`, file);
                });
            } else {
                formData.append(key, value as string);
            }
        });

        router.post(route('apartments.update'), formData, {
            onSuccess: () => {
                setShowEditModal(false);
            },
            forceFormData: true,
        });
    };

    const handleDeleteOpen = (apt: Apartment) => {
        setSelectedApartment(apt);
        setShowDeleteDialog(true);
    };

    const handleDelete = () => {
        router.delete(route('apartments.delete'), {
            data: { appartment_uid: selectedApartment?.appartment_uid },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedApartment(null);
            },
        });
    };

    const gasBadgeColor = (v: string) =>
        ({
            lpg: 'bg-orange-100 text-orange-700',
            card: 'bg-blue-100 text-blue-700',
            manual: 'bg-gray-100 text-gray-700',
            other: 'bg-purple-100 text-purple-700',
        })[v] ?? '';

    const waterBadgeColor = (v: string) =>
        ({
            wasa: 'bg-teal-100 text-teal-700',
            submersible_pump: 'bg-cyan-100 text-cyan-700',
            normal_pump: 'bg-sky-100 text-sky-700',
            other: 'bg-gray-100 text-gray-700',
        })[v] ?? '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Apartments" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Apartments</h1>
                        <p className="text-muted-foreground text-sm">Manage all apartment buildings</p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            createForm.setData('appartment_uid', generateUID());
                            setShowCreateModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Apartment
                    </Button>
                </div>

                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search by name, location, UID…"
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
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('appartment_uid')}>
                                    UID <SortIcon field="appartment_uid" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('appartment_name')}>
                                    Name <SortIcon field="appartment_name" />
                                </TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('appartment_location')}>
                                    Location <SortIcon field="appartment_location" />
                                </TableHead>
                                <TableHead className="cursor-pointer text-right select-none" onClick={() => handleSort('total_flats')}>
                                    Flats <SortIcon field="total_flats" />
                                </TableHead>
                                <TableHead className="cursor-pointer text-right select-none" onClick={() => handleSort('total_units')}>
                                    Units <SortIcon field="total_units" />
                                </TableHead>
                                <TableHead>Gas</TableHead>
                                <TableHead>Water</TableHead>
                                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('garage_location')}>
                                    Garage <SortIcon field="garage_location" />
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-muted-foreground py-10 text-center">
                                        No apartments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((apt) => (
                                    <TableRow key={apt.id}>
                                        <TableCell className="font-mono text-xs">{apt.appartment_uid}</TableCell>
                                        <TableCell className="font-medium">{apt.appartment_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{apt.appartment_location}</TableCell>
                                        <TableCell className="text-right">{apt.total_flats}</TableCell>
                                        <TableCell className="text-right">{apt.total_units}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gasBadgeColor(apt.gas_systen)}`}>
                                                {apt.gas_systen.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${waterBadgeColor(apt.water_systen)}`}>
                                                {apt.water_systen.replace(/_/g, ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="capitalize">{apt.garage_location.replace(/_/g, ' ')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditOpen(apt)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteOpen(apt)}
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

            <ApartmentModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                    createForm.setData('appartment_uid', generateUID());
                }}
                title="Create Apartment"
                form={createForm}
                onSubmit={handleCreate}
                submitLabel="Create"
                isCreate={true}
            />

            <ApartmentModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Apartment"
                form={editForm}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
                isCreate={false}
                existingImages={selectedApartment?.apartment_images?.split(',').filter((img) => img && img.trim() !== '') || []}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">Delete Apartment</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-400">
                            Are you sure you want to delete <strong>{selectedApartment?.appartment_name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500" onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

interface ApartmentModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    form: any;
    onSubmit: () => void;
    submitLabel: string;
    isCreate: boolean;
    existingImages?: string[];
}

function ApartmentModal({ open, onClose, title, form, onSubmit, submitLabel, isCreate, existingImages = [] }: ApartmentModalProps) {
    const { data, setData, errors, processing } = form;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<{ file: File; preview: string }[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            // Sync existing images from prop every time the modal opens
            setExistingImageUrls(existingImages);
            // Also reset any leftover new-image previews from a previous open
            setImagePreviews((prev) => {
                prev.forEach((p) => URL.revokeObjectURL(p.preview));
                return [];
            });
        }
    }, [open]);




    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newPreviews = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImagePreviews((prev) => [...prev, ...newPreviews]);

        // Update form data with all files
        const allFiles = [...imagePreviews.map((p) => p.file), ...files];
        setData('apartment_images', allFiles);
    };

    const removeNewImage = (index: number) => {
        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index].preview);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);

        // Update form data
        const remainingFiles = newPreviews.map((p) => p.file);
        setData('apartment_images', remainingFiles);
    };

    const removeExistingImage = (index: number) => {
        const updated = [...existingImageUrls];
        updated.splice(index, 1);
        setExistingImageUrls(updated);

        // Update existing_images string in form data
        setData('existing_images', updated.join(','));
    };

    const field = (name: keyof any, label: string, type = 'text', required = false, readOnly = false) => (
        <div className="grid gap-1.5">
            <Label htmlFor={name as string}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Input
                id={name as string}
                type={type}
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                readOnly={readOnly}
                className={readOnly ? 'bg-muted cursor-not-allowed opacity-70' : ''}
            />
            {errors[name as string] && <p className="text-destructive text-xs">{errors[name as string]}</p>}
        </div>
    );

    const selectField = (name: keyof any, label: string, options: { value: string; label: string }[], required = false) => (
        <div className="grid gap-1.5">
            <Label>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Select value={data[name]} onValueChange={(v) => setData(name, v)}>
                <SelectTrigger>
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
                    {field('appartment_uid', 'Apartment UID', 'text', true, !isCreate)}
                    {field('appartment_name', 'Apartment Name', 'text', true)}
                    <div className="sm:col-span-2">{field('appartment_location', 'Location', 'text', true)}</div>

                    {field('total_flats', 'Total Flats', 'number', true)}
                    {field('total_units', 'Total Units', 'number', true)}
                    {field('total_lifts', 'Total Lifts', 'number', true)}
                    {field('total_gas_lines', 'Gas Lines', 'number', true)}
                    {field('total_electricity_lines', 'Electricity Lines', 'number', true)}
                    {field('tot_solar_panels', 'Solar Panels', 'number', true)}

                    {field('doors_open_time', 'Doors Open Time', 'time', true)}
                    {field('doors_close_time', 'Doors Close Time', 'time', true)}

                    {selectField(
                        'gas_systen',
                        'Gas System',
                        [
                            { value: 'lpg', label: 'LPG' },
                            { value: 'card', label: 'Card' },
                            { value: 'manual', label: 'Manual' },
                            { value: 'other', label: 'Other' },
                        ],
                        true,
                    )}
                    {selectField(
                        'water_systen',
                        'Water System',
                        [
                            { value: 'wasa', label: 'WASA' },
                            { value: 'submersible_pump', label: 'Submersible Pump' },
                            { value: 'normal_pump', label: 'Normal Pump' },
                            { value: 'other', label: 'Other' },
                        ],
                        true,
                    )}

                    {field('water_in_time', 'Water In Time', 'time')}
                    {field('water_out_time', 'Water Out Time', 'time')}

                    {selectField(
                        'garage_location',
                        'Garage Location',
                        [
                            { value: 'no_garage', label: 'No Garage' },
                            { value: 'ground_floor', label: 'Ground Floor' },
                            { value: 'underground', label: 'Underground' },
                        ],
                        true,
                    )}
                    {field('garage_size', 'Garage Size')}
                    {field('garage_allocation', 'Garage Allocation')}
                    {field('garage_sections', 'Garage Sections (comma separated)')}

                    {selectField(
                        'terrace_option',
                        'Terrace Access',
                        [
                            { value: 'open_for_all', label: 'Open for All' },
                            { value: 'owners_only', label: 'Owners Only' },
                        ],
                        true,
                    )}

                    {/* Image Upload Section */}
                    <div className="sm:col-span-2">
                        <div className="grid gap-1.5">
                            <Label>Apartment Images {isCreate && <span className="text-destructive">*</span>}</Label>

                            {/* Existing Images (Edit Mode) */}
                            {!isCreate && existingImageUrls.length > 0 && (
                                <div className="mb-4">
                                    <Label className="text-muted-foreground mb-2 block text-sm">Current Images</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {existingImageUrls.map((url, idx) => (
                                            <div key={`existing-${idx}`} className="group relative h-24 w-24 overflow-hidden rounded-md border">
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
                                                    className="bg-destructive absolute top-1 right-1 rounded-full p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={() => removeExistingImage(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Images Preview */}
                            {imagePreviews.length > 0 && (
                                <div className="mb-4">
                                    <Label className="text-muted-foreground mb-2 block text-sm">New Images</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={`new-${idx}`} className="group relative h-24 w-24 overflow-hidden rounded-md border">
                                                <img src={preview.preview} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    className="bg-destructive absolute top-1 right-1 rounded-full p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={() => removeNewImage(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
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

                            {errors.apartment_images && <p className="text-destructive text-xs">{errors.apartment_images}</p>}
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="apartment_notes">Notes</Label>
                            <textarea
                                id="apartment_notes"
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                value={data.apartment_notes ?? ''}
                                onChange={(e) => setData('apartment_notes', e.target.value)}
                            />
                            {errors.apartment_notes && <p className="text-destructive text-xs">{errors.apartment_notes}</p>}
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
