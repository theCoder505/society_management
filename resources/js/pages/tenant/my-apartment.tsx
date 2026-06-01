import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import {
    Building,
    Building2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Flame,
    MapPin,
    ParkingSquare,
    Plug,
    X,
    ZoomIn,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/tenant/dashboard' },
    { title: 'My Apartment', href: '/tenant/my-apartment' },
];

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
    gas_systen: string;
    water_systen: string;
    water_in_time: string | null;
    water_out_time: string | null;
    garage_location: string;
    garage_size: string | null;
    garage_allocation: string | null;
    total_electricity_lines: number;
    tot_solar_panels: number;
    terrace_option: string;
    apartment_images: string | null;
    apartment_notes: string | null;
}

interface Props {
    apartments: Apartment[];
}

interface LightboxState {
    images: string[];
    index: number;
    label: string;
}

const gasLabel: Record<string, string> = {
    lpg: 'LPG',
    card: 'Card-based',
    manual: 'Manual',
    other: 'Other',
};

const waterLabel: Record<string, string> = {
    wasa: 'WASA',
    submersible_pump: 'Submersible Pump',
    normal_pump: 'Normal Pump',
    other: 'Other',
};

const garageLabel: Record<string, string> = {
    no_garage: 'No Garage',
    ground_floor: 'Ground Floor',
    underground: 'Underground',
};

/* ─── Lightbox ───────────────────────────────────────────────────────── */

function ImageLightbox({ state, onClose }: { state: LightboxState; onClose: () => void }) {
    const [current, setCurrent] = useState(state.index);
    const [fading, setFading] = useState(false);
    const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
    const total = state.images.length;

    const go = useCallback(
        (dir: 'prev' | 'next') => {
            if (fading) return;
            setSlideDir(dir === 'next' ? 'left' : 'right');
            setFading(true);
            setTimeout(() => {
                setCurrent((c) => (dir === 'next' ? (c + 1) % total : (c - 1 + total) % total));
                setSlideDir(null);
                setFading(false);
            }, 200);
        },
        [fading, total],
    );

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') go('next');
            else if (e.key === 'ArrowLeft') go('prev');
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [go, onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col bg-black/70"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <span className="text-white font-semibold text-base leading-tight">{state.label}</span>
                    <p className="text-neutral-400 text-xs mt-0.5">{current + 1} / {total}</p>
                </div>
                <button onClick={onClose} className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-16">
                {total > 1 && (
                    <button onClick={() => go('prev')} className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:scale-105 active:scale-95">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}
                <div
                    style={{
                        transition: fading ? 'opacity 0.2s ease, transform 0.2s ease' : 'none',
                        opacity: fading ? 0 : 1,
                        transform: fading ? `translateX(${slideDir === 'left' ? '-28px' : '28px'})` : 'translateX(0)',
                    }}
                    className="flex h-full w-full items-center justify-center"
                >
                    <img
                        key={current}
                        src={state.images[current]}
                        alt={`${state.label} — photo ${current + 1}`}
                        className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                        style={{ maxHeight: 'calc(100vh - 200px)' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
                    />
                </div>
                {total > 1 && (
                    <button onClick={() => go('next')} className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:scale-105 active:scale-95">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                )}
            </div>

            {total > 1 && (
                <div className="flex items-center justify-center gap-2 px-4 py-5 overflow-x-auto">
                    {state.images.map((src, idx) => (
                        <button key={idx} onClick={() => setCurrent(idx)} className="shrink-0 overflow-hidden rounded-lg transition-all"
                            style={{ width: 56, height: 40, outline: idx === current ? '2px solid white' : '2px solid transparent', outlineOffset: 2, opacity: idx === current ? 1 : 0.45, transform: idx === current ? 'scale(1.08)' : 'scale(1)', transition: 'all 0.18s ease' }}>
                            <img src={src} alt={`thumb ${idx + 1}`} className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }} />
                        </button>
                    ))}
                </div>
            )}

            {total > 1 && total <= 8 && (
                <div className="flex justify-center gap-1.5 pb-4">
                    {state.images.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrent(idx)} className="rounded-full transition-all"
                            style={{ width: idx === current ? 20 : 6, height: 6, background: idx === current ? 'white' : 'rgba(255,255,255,0.3)', transition: 'all 0.2s ease' }} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */

export default function TenantMyApartment({ apartments }: Props) {
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);

    const openLightbox = (images: string[], index: number, label: string) => {
        setLightbox({ images, index, label });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Apartment" />

            {lightbox && <ImageLightbox state={lightbox} onClose={() => setLightbox(null)} />}

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-foreground text-2xl font-bold tracking-tight">My Apartment</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Building information for the apartment(s) your flat belongs to
                    </p>
                </div>

                {apartments.length === 0 ? (
                    <div className="bg-card rounded-xl border p-12 text-center dark:border-neutral-800">
                        <Building className="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-40" />
                        <p className="text-muted-foreground text-sm">No apartment information is available for your account.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {apartments.map((apt) => {
                            const images = apt.apartment_images
                                ? apt.apartment_images.split(',').filter((i) => i.trim())
                                : [];
                            const label = apt.appartment_name;

                            return (
                                <div key={apt.id} className="bg-card overflow-hidden rounded-2xl border shadow-sm dark:border-neutral-800">
                                    {images.length > 0 ? (
                                        <div
                                            className="group relative h-52 lg:h-96 cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-900"
                                            onClick={() => openLightbox(images, 0, label)}
                                        >
                                            <img
                                                src={images[0]}
                                                alt={label}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
                                                <div className="flex items-center gap-2 rounded-full bg-white/0 px-4 py-2 text-white opacity-0 transition-all duration-200 group-hover:bg-white/20 group-hover:opacity-100 backdrop-blur-sm">
                                                    <ZoomIn className="h-4 w-4" />
                                                    <span className="text-sm font-medium">View Photos</span>
                                                </div>
                                            </div>
                                            {images.length > 1 && (
                                                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                                                    {images.length} photos
                                                </span>
                                            )}
                                            {images.length > 1 && (
                                                <div className="absolute bottom-2 left-2 flex gap-1">
                                                    {images.slice(1, 4).map((src, idx) => (
                                                        <button key={idx}
                                                            onClick={(e) => { e.stopPropagation(); openLightbox(images, idx + 1, label); }}
                                                            className="h-9 w-9 overflow-hidden rounded-md border-2 border-white/40 opacity-80 transition-all hover:opacity-100 hover:border-white hover:scale-105">
                                                            <img src={src} alt={`thumb ${idx + 2}`} className="h-full w-full object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        </button>
                                                    ))}
                                                    {images.length > 4 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openLightbox(images, 4, label); }}
                                                            className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-white/40 bg-black/50 text-xs font-bold text-white backdrop-blur-sm hover:bg-black/70">
                                                            +{images.length - 4}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30">
                                            <Building className="h-12 w-12 text-indigo-300" />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="mb-5 flex items-start justify-between gap-2">
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground">{apt.appartment_name}</h2>
                                                <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {apt.appartment_location}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-mono">
                                                {apt.appartment_uid}
                                            </span>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <InfoCard title="Building Overview" icon={Building2}>
                                                <InfoRow label="Total Flats" value={String(apt.total_flats)} />
                                                <InfoRow label="Total Units" value={String(apt.total_units)} />
                                                <InfoRow label="Total Lifts" value={String(apt.total_lifts)} />
                                            </InfoCard>

                                            <InfoCard title="Access Hours" icon={Clock}>
                                                <InfoRow label="Opens" value={apt.doors_open_time} />
                                                <InfoRow label="Closes" value={apt.doors_close_time} />
                                                <InfoRow label="Terrace" value={apt.terrace_option === 'open_for_all' ? 'Open for All' : 'Owners Only'} />
                                            </InfoCard>

                                            <InfoCard title="Utilities" icon={Flame}>
                                                <InfoRow label="Gas System" value={gasLabel[apt.gas_systen] ?? apt.gas_systen} />
                                                <InfoRow label="Water System" value={waterLabel[apt.water_systen] ?? apt.water_systen} />
                                                {apt.water_in_time && <InfoRow label="Water In" value={apt.water_in_time} />}
                                                {apt.water_out_time && <InfoRow label="Water Out" value={apt.water_out_time} />}
                                                <InfoRow label="Gas Lines" value={String(apt.total_gas_lines)} />
                                            </InfoCard>

                                            <InfoCard title="Electricity & Solar" icon={Plug}>
                                                <InfoRow label="Electricity Lines" value={String(apt.total_electricity_lines)} />
                                                <InfoRow label="Solar Panels" value={String(apt.tot_solar_panels)} />
                                            </InfoCard>

                                            <InfoCard title="Parking" icon={ParkingSquare}>
                                                <InfoRow label="Garage" value={garageLabel[apt.garage_location] ?? apt.garage_location} />
                                                {apt.garage_size && <InfoRow label="Garage Size" value={apt.garage_size} />}
                                                {apt.garage_allocation && <InfoRow label="Allocation" value={apt.garage_allocation} />}
                                            </InfoCard>
                                        </div>

                                        {apt.apartment_notes && (
                                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Building Notes</p>
                                                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{apt.apartment_notes}</p>
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

function InfoCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-muted/30 p-4 dark:border-neutral-700">
            <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
            </div>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground">{value}</span>
        </div>
    );
}