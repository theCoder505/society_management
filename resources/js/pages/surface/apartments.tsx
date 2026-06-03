import SurfaceApp from '@/layouts/surface/app';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

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

type Settings = {
    brand_name?: string;
};

interface Props {
    apartments: Apartment[];
    settings: Settings;
}

function getFirstImage(images: string): string | null {
    if (!images) return null;
    const parts = images.split(',');
    const path = parts[0].trim().replace(/\\/g, '');
    return path.startsWith('/') ? path : `/${path}`;
}

export default function Apartments({ apartments, settings }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredApartments = apartments.filter((apt) =>
        apt.appartment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appartment_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appartment_uid.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SurfaceApp>
            <Head title={`${settings?.brand_name || 'Society Management'} — Apartments`} />
            
            {/* Header section */}
            <div className="bg-[#1C2B1A] dark:bg-[#0E150D] py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#E8E4DA] mb-4">Our Premium Properties</h1>
                    <p className="text-[#A8C09A] text-lg max-w-2xl mx-auto mb-8">
                        Explore our portfolio of luxury apartment buildings, designed for comfort and modern living.
                    </p>
                    <div className="max-w-md mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search by name, location, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#2E4A2B] bg-[#142013] text-[#E8E4DA] placeholder-[#7A9A72] focus:outline-none focus:border-[#A8C09A] transition-colors"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-3.5 text-[#7A9A72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* List section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                {filteredApartments.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[#7A7A6C] dark:text-[#6A6A60] text-lg">No apartments match your search.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredApartments.map((apt) => {
                            const image = getFirstImage(apt.apartment_images);
                            return (
                                <Link
                                    key={apt.id}
                                    href={`/apartments/${apt.appartment_uid}`}
                                    className="group block overflow-hidden rounded-2xl border border-[#E2DFD4] bg-white transition-all duration-300 hover:border-[#B0C8A8] hover:shadow-lg dark:border-[#2A2A24] dark:bg-[#141412] dark:hover:border-[#3A5A36] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="relative h-56 overflow-hidden bg-[#F0EDE3] dark:bg-[#1A1A16]">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={apt.appartment_name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '';
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <svg className="h-12 w-12 text-[#C8C5B8] dark:text-[#3A3A34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                                    <polyline points="9 22 9 12 15 12 15 22" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 rounded-full bg-[#1C2B1A]/80 px-2.5 py-1 font-mono text-[11px] text-[#A8C09A] backdrop-blur-sm">
                                            {apt.appartment_uid}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="line-clamp-1 text-lg font-bold text-[#1C2B1A] transition-colors group-hover:text-[#2E5A28] dark:text-[#E8E4DA] dark:group-hover:text-[#C5DFB8]">
                                            {apt.appartment_name}
                                        </h3>
                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#7A7A6C] dark:text-[#6A6A60]">
                                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {apt.appartment_location}
                                        </p>
                                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F0EDE3] pt-4 dark:border-[#2A2A24]">
                                            <div>
                                                <p className="text-xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">{apt.total_flats || 0}</p>
                                                <p className="text-xs text-[#9A9A8A]">Total Flats</p>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">{apt.total_lifts || 0}</p>
                                                <p className="text-xs text-[#9A9A8A]">Elevators</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </SurfaceApp>
    );
}
