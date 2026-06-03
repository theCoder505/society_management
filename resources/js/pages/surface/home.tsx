
import SurfaceApp from '@/layouts/surface/app';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Apartment = {
    id: number;
    appartment_uid: string;
    appartment_name: string;
    appartment_location: string;
    total_flats: string;
    total_units: string;
    total_lifts: string;
    doors_open_time: string;
    doors_close_time: string;
    total_gas_lines: string;
    gas_systen: string;
    water_systen: string;
    garage_size: string;
    garage_allocation: string;
    tot_solar_panels: string;
    terrace_option: string;
    apartment_images: string;
    apartment_notes: string;
    created_at: string;
};

type Flat = {
    id: number;
    appartment_uid: string;
    flatID: string;
    owner_uid: string;
    flat_type: 'rented' | 'to_rent' | 'owned';
    tenant_uid: string | null;
    flat_price: string;
    flat_size: string;
    flat_bhk: string;
    tot_bedrooms: string;
    tot_washrooms: string;
    tot_balconies: string;
    drawing_dyning_kitchen: string;
    flat_images: string;
    rent_price: string;
    wifi: string;
    dish: string;
    gas: string;
    intercom: string;
    lift: string;
    note: string | null;
    bought_at: string | null;
};

type Settings = {
    brand_name?: string;
    brand_logo?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    contact_email?: string;
    location?: string;
    about?: string;
    gogle_map?: string;
};

interface HomeProps {
    apartments: Apartment[];
    flats: Flat[];
    settings: Settings;
    availableForRent: Flat[];
    availableForSale: Flat[];
}

// ─── Helper utilities ─────────────────────────────────────────────────────────

const APARTMENTS_PER_PAGE = 6;
const FLATS_PER_PAGE = 6;

function getFirstImage(images: string): string | null {
    if (!images) return null;
    const parts = images.split(',');
    const path = parts[0].trim().replace(/\\/g, '');
    return path.startsWith('/') ? path : `/${path}`;
}

function formatPrice(price: string): string {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    if (num >= 10000000) return `৳${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `৳${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `৳${(num / 1000).toFixed(0)}K`;
    return `৳${num.toLocaleString()}`;
}

function flatTypeLabel(type: string) {
    switch (type) {
        case 'to_rent':
            return {
                label: 'Available',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
            };
        case 'rented':
            return {
                label: 'Rented',
                color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
            };
        default:
            return { label: 'Owned', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300' };
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ApartmentCard({ apartment }: { apartment: Apartment }) {
    const image = getFirstImage(apartment.apartment_images);
    const flatsCount = parseInt(apartment.total_flats) || 0;
    const liftsCount = parseFloat(apartment.total_lifts) || 0;
    const solarCount = parseFloat(apartment.tot_solar_panels) || 0;

    return (
        <Link
            href={`/apartments/${apartment.appartment_uid}`}
            className="group block overflow-hidden rounded-2xl border border-[#E2DFD4] bg-white transition-all duration-300 hover:border-[#B0C8A8] hover:shadow-lg dark:border-[#2A2A24] dark:bg-[#141412] dark:hover:border-[#3A5A36] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-[#F0EDE3] dark:bg-[#1A1A16]">
                {image ? (
                    <img
                        src={image}
                        alt={apartment.appartment_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <svg
                            className="h-12 w-12 text-[#C8C5B8] dark:text-[#3A3A34]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                )}
                {/* Terrace badge */}
                {apartment.terrace_option === 'open_for_all' && (
                    <div className="absolute top-3 left-3 rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#1C2B1A] backdrop-blur-sm dark:bg-black/70 dark:text-[#C5DFB8]">
                        Open Terrace
                    </div>
                )}
                {/* ID badge */}
                <div className="absolute top-3 right-3 rounded-full bg-[#1C2B1A]/80 px-2.5 py-1 font-mono text-[11px] text-[#A8C09A] backdrop-blur-sm">
                    {apartment.appartment_uid}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-3">
                    <h3 className="line-clamp-1 text-base font-semibold text-[#1C2B1A] transition-colors group-hover:text-[#2E5A28] dark:text-[#E8E4DA] dark:group-hover:text-[#C5DFB8]">
                        {apartment.appartment_name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-[#7A7A6C] dark:text-[#6A6A60]">
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {apartment.appartment_location}
                    </p>
                </div>

                {/* Stats row */}
                <div className="mb-3 grid grid-cols-3 gap-2 border-t border-b border-[#F0EDE3] py-3 dark:border-[#2A2A24]">
                    <div className="text-center">
                        <p className="text-[18px] font-semibold text-[#1C2B1A] dark:text-[#E8E4DA]">{flatsCount}</p>
                        <p className="text-[11px] text-[#9A9A8A]">Flats</p>
                    </div>
                    <div className="border-x border-[#F0EDE3] text-center dark:border-[#2A2A24]">
                        <p className="text-[18px] font-semibold text-[#1C2B1A] dark:text-[#E8E4DA]">{liftsCount}</p>
                        <p className="text-[11px] text-[#9A9A8A]">Lifts</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[18px] font-semibold text-[#1C2B1A] dark:text-[#E8E4DA]">{solarCount}</p>
                        <p className="text-[11px] text-[#9A9A8A]">Solar</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-1 text-[#7A7A6C]">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {apartment.doors_open_time} – {apartment.doors_close_time}
                    </div>
                    <span className="flex items-center gap-0.5 font-medium text-[#2E5A28] dark:text-[#A8C09A]">
                        View details
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}

function FlatCard({ flat }: { flat: Flat }) {
    const image = getFirstImage(flat.flat_images);
    const status = flatTypeLabel(flat.flat_type);
    const bhk = flat.flat_bhk;
    const size = parseFloat(flat.flat_size);

    const amenities = [
        {
            key: 'wifi' as keyof Flat,
            label: 'WiFi',
            icon: (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                </svg>
            ),
        },
        {
            key: 'lift' as keyof Flat,
            label: 'Lift',
            icon: (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M9 10l3-3 3 3M9 14l3 3 3-3" />
                </svg>
            ),
        },
        {
            key: 'gas' as keyof Flat,
            label: 'Gas',
            icon: (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22a8 8 0 0 0 8-8c0-4.4-8-12-8-12S4 9.6 4 14a8 8 0 0 0 8 8z" />
                </svg>
            ),
        },
        {
            key: 'intercom' as keyof Flat,
            label: 'Intercom',
            icon: (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.63 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.7 4.18 2 2 0 0 1 4.68 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 9.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
            ),
        },
    ].filter((a) => flat[a.key] === 'yes');

    return (
        <Link
            href={`/flats/${flat.appartment_uid}/${flat.flatID}`}
            className="group block overflow-hidden rounded-2xl border border-[#E2DFD4] bg-white transition-all duration-300 hover:border-[#B0C8A8] hover:shadow-lg dark:border-[#2A2A24] dark:bg-[#141412] dark:hover:border-[#3A5A36] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-[#F0EDE3] dark:bg-[#1A1A16]">
                {image ? (
                    <img
                        src={image}
                        alt={flat.flatID}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <svg
                            className="h-10 w-10 text-[#C8C5B8] dark:text-[#3A3A34]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                )}
                {/* Status badge */}
                <div className={`absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.color}`}>{status.label}</div>
                {/* BHK badge */}
                <div className="absolute top-3 right-3 rounded-full bg-[#1C2B1A]/80 px-2.5 py-1 font-mono text-[11px] text-[#A8C09A] backdrop-blur-sm">
                    {bhk} BHK
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold text-[#1C2B1A] dark:text-[#E8E4DA]">{flat.flatID}</p>
                        <p className="font-mono text-[12px] text-[#7A7A6C]">{flat.appartment_uid}</p>
                    </div>
                    <div className="text-right">
                        {flat.flat_type === 'to_rent' && (
                            <p className="text-base font-semibold text-[#2E5A28] dark:text-[#A8C09A]">
                                {formatPrice(flat.rent_price)}
                                <span className="text-[11px] font-normal text-[#7A7A6C]">/mo</span>
                            </p>
                        )}
                        <p className="text-[11px] text-[#9A9A8A]">{formatPrice(flat.flat_price)}</p>
                    </div>
                </div>

                {/* Specs row */}
                <div className="mb-3 flex items-center gap-3 text-[12px] text-[#7A7A6C]">
                    <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 7v10M21 5v14M7 7v10M17 5v14M3 12h4M17 12h4M7 12h10" />
                        </svg>
                        {flat.tot_bedrooms} Bed
                    </span>
                    <span className="text-[#D8D5CC]">·</span>
                    <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                            <line x1="10" y1="5" x2="8" y2="7" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                        </svg>
                        {flat.tot_washrooms} Bath
                    </span>
                    <span className="text-[#D8D5CC]">·</span>
                    <span>{!isNaN(size) ? `${size.toLocaleString()} sqft` : `${flat.flat_size} sqft`}</span>
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-[#F0EDE3] pt-2.5 dark:border-[#2A2A24]">
                        {amenities.slice(0, 4).map((a) => (
                            <span
                                key={a.key}
                                className="inline-flex items-center gap-1 rounded-md border border-[#E8E4DA] bg-[#F7F6F2] px-2 py-0.5 text-[11px] text-[#7A7A6C] dark:border-[#2A2A24] dark:bg-[#1E1E1A] dark:text-[#6A6A60]"
                            >
                                {a.icon}
                                {a.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ apartments, flats, availableForRent }: Pick<HomeProps, 'apartments' | 'flats' | 'availableForRent'>) {
    const stats = [
        { value: apartments.length, label: 'Apartment Buildings' },
        { value: flats.length, label: 'Total Flats' },
        { value: availableForRent.length, label: 'Available for Rent' },
        { value: flats.filter((f) => f.flat_type === 'rented').length, label: 'Occupied Flats' },
    ];
    return (
        <div className="grid grid-cols-2 gap-px border-y border-[#E2DFD4] bg-[#E2DFD4] md:grid-cols-4 dark:border-[#2A2A24] dark:bg-[#2A2A24]">
            {stats.map((s) => (
                <div key={s.label} className="bg-[#FAFAF7] px-6 py-6 text-center dark:bg-[#0E0E0C]">
                    <p className="text-3xl font-bold text-[#1C2B1A] tabular-nums dark:text-[#E8E4DA]">{s.value}</p>
                    <p className="mt-0.5 text-[12px] tracking-wide text-[#7A7A6C] uppercase dark:text-[#6A6A60]">{s.label}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SurfaceHome({ apartments, flats, settings, availableForRent }: HomeProps) {
    const [apartmentPage, setApartmentPage] = useState(1);
    const [flatPage, setFlatPage] = useState(1);

    const visibleApartments = apartments.slice(0, apartmentPage * APARTMENTS_PER_PAGE);
    const visibleFlats = flats.slice(0, flatPage * FLATS_PER_PAGE);
    const hasMoreApartments = apartments.length > visibleApartments.length;
    const hasMoreFlats = flats.length > visibleFlats.length;

    return (
        <SurfaceApp>
            <Head title={`${settings?.brand_name || 'Society Management'} — Home`} />

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <section className="relative min-h-[85vh] overflow-hidden bg-[#0E0E0C]">
                {/* Unsplash hero image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=80"
                        alt="Modern luxury apartment building at twilight"
                        className="h-full w-full object-cover"
                    />
                    {/* Gradient overlays for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a09]/95 via-[#0a0a09]/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a09]/80 via-transparent to-[#0a0a09]/30" />
                </div>

                {/* Subtle animated dot pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />

                {/* Content */}
                <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-7xl items-center px-4 py-24 md:px-8">
                    <div className="max-w-2xl">
                        {/* Availability badge */}
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[12px] font-medium text-emerald-400 backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                            {availableForRent.length} Flats Available for Rent
                        </div>

                        {/* Heading */}
                        <h1 className="mb-6 text-5xl leading-[1.05] font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                            Modern Living,
                            <br />
                            <span className="bg-gradient-to-r from-[#A8C09A] to-[#7FB069] bg-clip-text text-transparent">
                                Elevated.
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="mb-10 max-w-lg text-lg leading-relaxed text-white/60">
                            Discover, rent, or manage premium apartments. A unified platform for residents, flat owners, and administrators.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col items-start gap-4 sm:flex-row">
                            <Link
                                href="/apartments"
                                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#2E5A28] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all duration-300 hover:bg-[#367030] hover:shadow-emerald-900/50 hover:scale-[1.02]"
                            >
                                Browse Apartments
                                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                href="/tenant/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                            >
                                Tenant Portal
                            </Link>
                        </div>

                        {/* Quick stats row */}
                        <div className="mt-16 flex gap-10 border-t border-white/10 pt-8">
                            <div>
                                <p className="text-3xl font-bold text-white tabular-nums">{apartments.length}</p>
                                <p className="mt-1 text-[12px] tracking-wider text-white/40 uppercase">Buildings</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white tabular-nums">{flats.length}</p>
                                <p className="mt-1 text-[12px] tracking-wider text-white/40 uppercase">Total Flats</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#A8C09A] tabular-nums">{availableForRent.length}</p>
                                <p className="mt-1 text-[12px] tracking-wider text-white/40 uppercase">For Rent</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom fade into next section */}
                <div className="absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-[#0E0E0C] to-transparent" />
            </section>



            {/* ── Apartments section ─────────────────────────────────────── */}
            <section className="bg-[#F7F6F2] px-4 py-16 dark:bg-[#0A0A09]">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <p className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-[#7A7A6C] uppercase dark:text-[#5A5A50]">
                                Our Portfolio
                            </p>
                            <h2 className="text-2xl font-bold text-[#1C2B1A] md:text-3xl dark:text-[#E8E4DA]">Apartment Buildings</h2>
                        </div>
                        {apartments.length > APARTMENTS_PER_PAGE && (
                            <Link
                                href="/apartments"
                                className="hidden items-center gap-1.5 text-sm font-medium text-[#2E5A28] hover:underline sm:inline-flex dark:text-[#A8C09A]"
                            >
                                View all {apartments.length}
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {apartments.length === 0 ? (
                        <div className="py-16 text-center text-[#9A9A8A]">
                            <svg className="mx-auto mb-3 h-12 w-12 opacity-40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            </svg>
                            <p>No apartments listed yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {visibleApartments.map((apt) => (
                                    <ApartmentCard key={apt.id} apartment={apt} />
                                ))}
                            </div>

                            {hasMoreApartments && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => setApartmentPage((p) => p + 1)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8C5B8] px-6 py-3 text-sm font-medium text-[#1C2B1A] transition-colors hover:bg-[#EDEAE0] dark:border-[#3A3A34] dark:text-[#E8E4DA] dark:hover:bg-[#1E1E1A]"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M12 5v14M5 12l7 7 7-7" />
                                        </svg>
                                        Load more apartments ({apartments.length - visibleApartments.length} remaining)
                                    </button>
                                </div>
                            )}
                            {!hasMoreApartments && apartments.length > APARTMENTS_PER_PAGE && (
                                <div className="mt-8 text-center">
                                    <Link
                                        href="/apartments"
                                        className="inline-flex items-center gap-2 rounded-xl border border-[#C8C5B8] px-6 py-3 text-sm font-medium text-[#2E5A28] transition-colors hover:bg-[#EEF4EB] dark:border-[#3A3A34] dark:text-[#A8C09A] dark:hover:bg-[#1A2A18]"
                                    >
                                        View All Apartments Page →
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* ── Available for Rent banner ──────────────────────────────── */}
            {availableForRent.length > 0 && (
                <div className="bg-[#1C2B1A] px-4 py-10 dark:bg-[#0D1A0C]">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2E4A2B]">
                                <svg className="h-6 w-6 text-[#A8C09A]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-base font-semibold text-[#E8E4DA]">
                                    {availableForRent.length} {availableForRent.length === 1 ? 'Flat' : 'Flats'} Available for Rent
                                </p>
                                <p className="text-sm text-[#7A9A72]">
                                    Starting from{' '}
                                    {availableForRent.length > 0
                                        ? formatPrice(Math.min(...availableForRent.map((f) => parseFloat(f.rent_price) || 0)).toString())
                                        : '—'}
                                    /month
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/flats"
                            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#A8C09A] px-5 py-2.5 text-sm font-medium text-[#1C2B1A] transition-colors hover:bg-[#B8D0AA]"
                        >
                            Browse Available Flats →
                        </Link>
                    </div>
                </div>
            )}

            {/* ── All Flats section ──────────────────────────────────────── */}
            <section className="bg-[#FAFAF7] px-4 py-16 dark:bg-[#0E0E0C]">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <p className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-[#7A7A6C] uppercase dark:text-[#5A5A50]">All Units</p>
                            <h2 className="text-2xl font-bold text-[#1C2B1A] md:text-3xl dark:text-[#E8E4DA]">Flats Directory</h2>
                        </div>
                        {flats.length > FLATS_PER_PAGE && (
                            <Link
                                href="/flats"
                                className="hidden items-center gap-1.5 text-sm font-medium text-[#2E5A28] hover:underline sm:inline-flex dark:text-[#A8C09A]"
                            >
                                View all {flats.length}
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Group flats by apartment */}
                    {apartments.map((apt) => {
                        const aptFlats = visibleFlats.filter((f) => f.appartment_uid === apt.appartment_uid);
                        if (aptFlats.length === 0) return null;
                        return (
                            <div key={apt.appartment_uid} className="mb-10">
                                <div className="mb-4 flex items-center gap-3">
                                    <Link href={`/apartments/${apt.appartment_uid}`} className="group flex items-center gap-2">
                                        <span className="rounded-full border border-[#B0C8A8] bg-[#EEF4EB] px-2.5 py-1 font-mono text-[11px] text-[#2E5A28] dark:border-[#2E4A2B] dark:bg-[#1A2A18] dark:text-[#A8C09A]">
                                            {apt.appartment_uid}
                                        </span>
                                        <span className="text-sm font-semibold text-[#1C2B1A] transition-colors group-hover:text-[#2E5A28] dark:text-[#E8E4DA] dark:group-hover:text-[#A8C09A]">
                                            {apt.appartment_name}
                                        </span>
                                        <svg
                                            className="h-3.5 w-3.5 text-[#9A9A8A] transition-colors group-hover:text-[#2E5A28] dark:group-hover:text-[#A8C09A]"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    <span className="ml-1 text-[11px] text-[#9A9A8A]">{aptFlats.length} flats shown</span>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {aptFlats.map((flat) => (
                                        <FlatCard key={flat.id} flat={flat} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Flats not associated with shown apartments */}
                    {(() => {
                        const aptUids = apartments.map((a) => a.appartment_uid);
                        const orphanFlats = visibleFlats.filter((f) => !aptUids.includes(f.appartment_uid));
                        if (orphanFlats.length === 0) return null;
                        return (
                            <div className="mb-10">
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[#1C2B1A] dark:text-[#E8E4DA]">Other Flats</span>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {orphanFlats.map((flat) => (
                                        <FlatCard key={flat.id} flat={flat} />
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {hasMoreFlats && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setFlatPage((p) => p + 1)}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#C8C5B8] px-6 py-3 text-sm font-medium text-[#1C2B1A] transition-colors hover:bg-[#EDEAE0] dark:border-[#3A3A34] dark:text-[#E8E4DA] dark:hover:bg-[#1E1E1A]"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M12 5v14M5 12l7 7 7-7" />
                                </svg>
                                Load more flats ({flats.length - visibleFlats.length} remaining)
                            </button>
                        </div>
                    )}
                    {!hasMoreFlats && flats.length > FLATS_PER_PAGE && (
                        <div className="mt-4 text-center">
                            <Link
                                href="/flats"
                                className="inline-flex items-center gap-2 rounded-xl border border-[#C8C5B8] px-6 py-3 text-sm font-medium text-[#2E5A28] transition-colors hover:bg-[#EEF4EB] dark:border-[#3A3A34] dark:text-[#A8C09A] dark:hover:bg-[#1A2A18]"
                            >
                                View All Flats Page →
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── About / map section ────────────────────────────────────── */}
            {(settings?.about || settings?.gogle_map) && (
                <section className="bg-[#F7F6F2] px-4 py-16 dark:bg-[#0A0A09]">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-start gap-10 md:grid-cols-2">
                            {settings?.about && (
                                <div>
                                    <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-[#7A7A6C] uppercase dark:text-[#5A5A50]">
                                        Who We Are
                                    </p>
                                    <h2 className="mb-4 text-2xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">About Us</h2>
                                    <div
                                        className="prose prose-sm max-w-none leading-relaxed text-[#5A5A50] dark:text-[#7A7A6A]"
                                        dangerouslySetInnerHTML={{ __html: settings.about }}
                                    />
                                    <div className="mt-6 flex gap-3">
                                        <Link
                                            href="/about"
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2E5A28] hover:underline dark:text-[#A8C09A]"
                                        >
                                            Read more about us →
                                        </Link>
                                        {settings?.contact_email && (
                                            <a
                                                href={`mailto:${settings.contact_email}`}
                                                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A5A50] hover:underline dark:text-[#9A9A8A]"
                                            >
                                                Contact us
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                            {settings?.gogle_map && (
                                <div>
                                    <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-[#7A7A6C] uppercase dark:text-[#5A5A50]">
                                        Find Us
                                    </p>
                                    <h2 className="mb-4 text-2xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">Our Location</h2>
                                    <div
                                        className="overflow-hidden rounded-2xl border border-[#E2DFD4] dark:border-[#2A2A24] [&_iframe]:h-64 [&_iframe]:w-full [&_iframe]:md:h-80"
                                        dangerouslySetInnerHTML={{ __html: settings.gogle_map }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Portals CTA ────────────────────────────────────────────── */}
            <section className="bg-[#FAFAF7] px-4 py-16 dark:bg-[#0E0E0C]">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-10 text-center">
                        <h2 className="mb-2 text-2xl font-bold text-[#1C2B1A] md:text-3xl dark:text-[#E8E4DA]">Access Your Portal</h2>
                        <p className="text-[#7A7A6C] dark:text-[#6A6A60]">Tailored dashboards for every role in the society.</p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {[
                            {
                                icon: (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                ),
                                title: 'Tenant Portal',
                                desc: 'Pay rent, raise requests, view notices.',
                                href: '/tenant/dashboard',
                                color: 'bg-[#EEF4EB] dark:bg-[#1A2A18] border-[#B0C8A8] dark:border-[#2E4A2B] text-[#2E5A28] dark:text-[#A8C09A]',
                            },
                            {
                                icon: (
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                ),
                                title: 'Owner Portal',
                                desc: 'Manage your flats, track income.',
                                href: '/owner/dashboard',
                                color: 'bg-[#F0EDE3] dark:bg-[#1A1A14] border-[#C8C5B8] dark:border-[#3A3A2A] text-[#5A5040] dark:text-[#C0BC9A]',
                            }
                        ].map((portal) => (
                            <Link
                                key={portal.href}
                                href={portal.href}
                                className={`group block rounded-2xl border p-6 transition-all hover:shadow-md ${portal.color}`}
                            >
                                <div className="mb-3">{portal.icon}</div>
                                <h3 className="mb-1.5 text-base font-semibold">{portal.title}</h3>
                                <p className="mb-4 text-sm opacity-70">{portal.desc}</p>
                                <span className="flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2">
                                    Enter portal
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </SurfaceApp>
    );
}
