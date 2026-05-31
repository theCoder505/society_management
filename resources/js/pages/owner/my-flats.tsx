import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building,
    Building2,
    ExternalLink,
    Flame,
    Home,
    Phone,
    StickyNote,
    Tv2,
    User,
    Wifi,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/owner/dashboard' },
    { title: 'My Flats', href: '/owner/my-flats' },
];

interface Flat {
    id: number;
    flatID: string;
    appartment_uid: string | null;
    apartment_name?: string | null;
    flat_type: string;
    flat_size: number;
    flat_bhk: number;
    tot_bedrooms: number;
    tot_washrooms: number;
    tot_balconies: number;
    drawing_dyning_kitchen: string;
    flat_images: string | null;
    flat_3d_video: string | null;
    rent_price: number | null;
    flat_price: number;
    wifi: 'yes' | 'no';
    dish: 'yes' | 'no';
    gas: 'yes' | 'no';
    intercom: 'yes' | 'no';
    lift: 'yes' | 'no';
    note: string | null;
    tenant_uid: string | null;
    tenant_name?: string | null;
}

interface Props {
    flats: Flat[];
}

const ddkLabel: Record<string, string> = {
    all_together: 'Combined Drawing/Dining/Kitchen',
    all_seperate: 'All Separate',
    seperate_kitchen: 'Separate Kitchen',
    seperate_drawing: 'Separate Drawing',
};

const typeBadge: Record<string, string> = {
    rented: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    to_rent: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    to_live: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

const typeLabel: Record<string, string> = {
    rented: 'Rented',
    to_rent: 'Available to Rent',
    to_live: 'Owner Occupied',
};

export default function OwnerMyFlats({ flats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Flats" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold tracking-tight">My Owned Flats</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            All flats registered under your ownership
                        </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {flats.length} Flat{flats.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {flats.length === 0 ? (
                    <div className="bg-card rounded-xl border p-12 text-center dark:border-neutral-800">
                        <Home className="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-40" />
                        <p className="text-muted-foreground text-sm">No flats are registered under your ownership yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {flats.map((flat) => {
                            const images = flat.flat_images
                                ? flat.flat_images.split(',').filter((i) => i.trim())
                                : [];

                            return (
                                <div
                                    key={flat.id}
                                    className="bg-card overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800"
                                >
                                    {/* Image */}
                                    {images.length > 0 ? (
                                        <div className="relative h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                            <img
                                                src={images[0]}
                                                alt={`Flat ${flat.flatID}`}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            {images.length > 1 && (
                                                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                                                    +{images.length - 1} more
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30">
                                            <Building2 className="h-10 w-10 text-blue-300" />
                                        </div>
                                    )}

                                    <div className="p-5">
                                        {/* Title Row */}
                                        <div className="mb-4 flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-base font-bold text-foreground">
                                                        {flat.flatID}
                                                    </span>
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                        {flat.flat_bhk} BHK
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge[flat.flat_type] ?? ''}`}
                                                    >
                                                        {typeLabel[flat.flat_type] ?? flat.flat_type}
                                                    </span>
                                                </div>
                                                {flat.apartment_name && (
                                                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                                                        <Building className="h-3 w-3" />
                                                        {flat.apartment_name}
                                                        {flat.appartment_uid && (
                                                            <Link
                                                                href="/owner/my-apartments"
                                                                className="ml-1 font-mono text-primary underline-offset-2 hover:underline"
                                                            >
                                                                ({flat.appartment_uid})
                                                            </Link>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                {flat.rent_price ? (
                                                    <>
                                                        <p className="text-xs text-muted-foreground">Rent</p>
                                                        <p className="text-base font-bold text-primary">
                                                            ৳{Number(flat.rent_price).toLocaleString('en-IN')}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-xs text-muted-foreground">Price</p>
                                                        <p className="text-base font-bold text-foreground">
                                                            ৳{Number(flat.flat_price).toLocaleString('en-IN')}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tenant Badge */}
                                        {flat.tenant_uid && (
                                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                                                <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <div>
                                                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                                        {flat.tenant_name ?? 'Tenant'}
                                                    </p>
                                                    <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-500">
                                                        {flat.tenant_uid}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Stats Grid */}
                                        <div className="mb-4 grid grid-cols-3 gap-3">
                                            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                                                <p className="text-xs text-muted-foreground">Size</p>
                                                <p className="mt-0.5 text-sm font-semibold text-foreground">{flat.flat_size} sqft</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                                                <p className="text-xs text-muted-foreground">Bedrooms</p>
                                                <p className="mt-0.5 text-sm font-semibold text-foreground">{flat.tot_bedrooms}</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                                                <p className="text-xs text-muted-foreground">Washrooms</p>
                                                <p className="mt-0.5 text-sm font-semibold text-foreground">{flat.tot_washrooms}</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                                                <p className="text-xs text-muted-foreground">Balconies</p>
                                                <p className="mt-0.5 text-sm font-semibold text-foreground">{flat.tot_balconies}</p>
                                            </div>
                                            <div className="col-span-2 rounded-lg bg-muted/50 p-2.5">
                                                <p className="text-xs text-muted-foreground">Layout</p>
                                                <p className="mt-0.5 text-xs font-medium text-foreground">
                                                    {ddkLabel[flat.drawing_dyning_kitchen] ?? flat.drawing_dyning_kitchen}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amenities */}
                                        <div className="mb-4">
                                            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Amenities
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(
                                                    [
                                                        { key: 'wifi', label: 'WiFi', icon: Wifi },
                                                        { key: 'gas', label: 'Gas', icon: Flame },
                                                        { key: 'dish', label: 'Dish/TV', icon: Tv2 },
                                                        { key: 'intercom', label: 'Intercom', icon: Phone },
                                                        { key: 'lift', label: 'Lift', icon: ArrowRight },
                                                    ] as const
                                                ).map(({ key, label, icon: Icon }) => (
                                                    <span
                                                        key={key}
                                                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            flat[key] === 'yes'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                                : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 line-through'
                                                        }`}
                                                    >
                                                        <Icon className="h-3 w-3" />
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3D Video */}
                                        {flat.flat_3d_video && (
                                            <a
                                                href={flat.flat_3d_video}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mb-4 flex items-center gap-1.5 text-xs text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View 3D Tour
                                            </a>
                                        )}

                                        {/* Note */}
                                        {flat.note && (
                                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                                                <p className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                                                    <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                    {flat.note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
