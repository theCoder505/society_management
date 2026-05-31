import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Building,
    Building2,
    Clock,
    Droplets,
    Flame,
    Layers,
    MapPin,
    Plug,
    ParkingSquare,
    Sun,
    TreePine,
    Wind,
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

export default function TenantMyApartment({ apartments }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Apartment" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
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

                            return (
                                <div
                                    key={apt.id}
                                    className="bg-card overflow-hidden rounded-2xl border shadow-sm dark:border-neutral-800"
                                >
                                    {/* Image */}
                                    {images.length > 0 ? (
                                        <div className="relative h-52 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                            <img
                                                src={images[0]}
                                                alt={apt.appartment_name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            {images.length > 1 && (
                                                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                                                    +{images.length - 1} photos
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30">
                                            <Building className="h-12 w-12 text-indigo-300" />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Title */}
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

                                        {/* Info Grid */}
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {/* Building Overview */}
                                            <InfoCard title="Building Overview" icon={Building2}>
                                                <InfoRow label="Total Flats" value={String(apt.total_flats)} />
                                                <InfoRow label="Total Units" value={String(apt.total_units)} />
                                                <InfoRow label="Total Lifts" value={String(apt.total_lifts)} />
                                            </InfoCard>

                                            {/* Access Hours */}
                                            <InfoCard title="Access Hours" icon={Clock}>
                                                <InfoRow label="Opens" value={apt.doors_open_time} />
                                                <InfoRow label="Closes" value={apt.doors_close_time} />
                                                <InfoRow
                                                    label="Terrace"
                                                    value={
                                                        apt.terrace_option === 'open_for_all'
                                                            ? 'Open for All'
                                                            : 'Owners Only'
                                                    }
                                                />
                                            </InfoCard>

                                            {/* Gas & Water */}
                                            <InfoCard title="Utilities" icon={Flame}>
                                                <InfoRow label="Gas System" value={gasLabel[apt.gas_systen] ?? apt.gas_systen} />
                                                <InfoRow
                                                    label="Water System"
                                                    value={waterLabel[apt.water_systen] ?? apt.water_systen}
                                                />
                                                {apt.water_in_time && (
                                                    <InfoRow label="Water In" value={apt.water_in_time} />
                                                )}
                                                {apt.water_out_time && (
                                                    <InfoRow label="Water Out" value={apt.water_out_time} />
                                                )}
                                                <InfoRow label="Gas Lines" value={String(apt.total_gas_lines)} />
                                            </InfoCard>

                                            {/* Electricity */}
                                            <InfoCard title="Electricity & Solar" icon={Plug}>
                                                <InfoRow
                                                    label="Electricity Lines"
                                                    value={String(apt.total_electricity_lines)}
                                                />
                                                <InfoRow label="Solar Panels" value={String(apt.tot_solar_panels)} />
                                            </InfoCard>

                                            {/* Parking */}
                                            <InfoCard title="Parking" icon={ParkingSquare}>
                                                <InfoRow
                                                    label="Garage"
                                                    value={garageLabel[apt.garage_location] ?? apt.garage_location}
                                                />
                                                {apt.garage_size && <InfoRow label="Garage Size" value={apt.garage_size} />}
                                                {apt.garage_allocation && (
                                                    <InfoRow label="Allocation" value={apt.garage_allocation} />
                                                )}
                                            </InfoCard>
                                        </div>

                                        {/* Notes */}
                                        {apt.apartment_notes && (
                                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                                                    Building Notes
                                                </p>
                                                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                                    {apt.apartment_notes}
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

function InfoCard({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
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
