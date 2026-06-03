import SurfaceApp from '@/layouts/surface/app';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

type Flat = {
    id: number;
    appartment_uid: string;
    flatID: string;
    owner_uid: string | null;
    flat_type: 'rented' | 'to_rent' | 'owned';
    flat_price: string;
    flat_size: string;
    flat_bhk: string;
    tot_bedrooms: string;
    tot_washrooms: string;
    flat_images: string;
    rent_price: string;
    wifi: string;
    gas: string;
    lift: string;
    intercom: string;
};

type Apartment = {
    appartment_uid: string;
    appartment_name: string;
};

type Settings = {
    brand_name?: string;
};

interface Props {
    flats: Flat[];
    apartments: Apartment[];
    settings: Settings;
}

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

export default function Flats({ flats, apartments, settings }: Props) {
    const [filter, setFilter] = useState<'all' | 'rent' | 'sale'>('all');
    const [bhkFilter, setBhkFilter] = useState<string>('all');
    
    const bhkOptions = useMemo(() => {
        const set = new Set(flats.map(f => f.flat_bhk));
        return Array.from(set).sort();
    }, [flats]);

    const filteredFlats = flats.filter(flat => {
        if (filter === 'rent' && flat.flat_type !== 'to_rent') return false;
        if (filter === 'sale' && flat.owner_uid !== null) return false;
        if (bhkFilter !== 'all' && flat.flat_bhk !== bhkFilter) return false;
        return true;
    });

    return (
        <SurfaceApp>
            <Head title={`${settings?.brand_name || 'Society Management'} — Available Flats`} />
            
            <div className="bg-slate-50 dark:bg-[#0E0E0C] border-b border-slate-200 dark:border-[#2A2A24] py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-[#E8E4DA] mb-2">Find Your Flat</h1>
                        <p className="text-slate-500 dark:text-[#6A6A60]">Discover the perfect space for you across our premium locations.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                            value={filter} 
                            onChange={e => setFilter(e.target.value as 'all' | 'rent' | 'sale')}
                            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 dark:border-[#3A3A34] dark:bg-[#141412] dark:text-[#E8E4DA] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-shadow shadow-sm cursor-pointer"
                        >
                            <option value="all">All Flats</option>
                            <option value="rent">Available for Rent</option>
                            <option value="sale">Available for Sale</option>
                        </select>
                        <select 
                            value={bhkFilter} 
                            onChange={e => setBhkFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 dark:border-[#3A3A34] dark:bg-[#141412] dark:text-[#E8E4DA] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-shadow shadow-sm cursor-pointer"
                        >
                            <option value="all">Any BHK</option>
                            {bhkOptions.map(bhk => (
                                <option key={bhk} value={bhk}>{bhk} BHK</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                {filteredFlats.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-[#6A6A60] text-lg">No flats match your filters.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredFlats.map((flat) => {
                            const image = getFirstImage(flat.flat_images);
                            const isRent = flat.flat_type === 'to_rent';
                            const isSale = flat.owner_uid === null;
                            const aptName = apartments.find(a => a.appartment_uid === flat.appartment_uid)?.appartment_name || flat.appartment_uid;
                            
                            return (
                                <Link
                                    key={flat.id}
                                    href={`/flats/${flat.appartment_uid}/${flat.flatID}`}
                                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-[#2A2A24] dark:bg-[#141412] dark:hover:border-[#3A5A36] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-[#1A1A16]">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={flat.flatID}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <svg className="h-10 w-10 text-slate-300 dark:text-[#3A3A34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                        )}
                                        {isRent && (
                                            <div className="absolute top-3 left-3 rounded-full bg-emerald-500/90 text-white px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                                                For Rent
                                            </div>
                                        )}
                                        {isSale && !isRent && (
                                            <div className="absolute top-3 left-3 rounded-full bg-blue-500/90 text-white px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                                                For Sale
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 rounded-full bg-slate-900/70 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-sm dark:bg-[#1C2B1A]/80 dark:text-[#A8C09A]">
                                            {flat.flat_bhk} BHK
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-[#E8E4DA]">{flat.flatID}</h3>
                                                <p className="text-xs text-slate-500 dark:text-[#6A6A60]">{aptName}</p>
                                            </div>
                                            <div className="text-right">
                                                {isRent ? (
                                                    <p className="text-lg font-bold text-emerald-700 dark:text-[#A8C09A]">
                                                        {formatPrice(flat.rent_price)}<span className="text-xs font-normal text-slate-500 dark:text-[#7A7A6C]">/mo</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-lg font-bold text-slate-900 dark:text-[#E8E4DA]">
                                                        {formatPrice(flat.flat_price)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-[#9A9A8A] border-t border-slate-100 dark:border-[#2A2A24] pt-3">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10M21 5v14M7 7v10M17 5v14M3 12h4M17 12h4M7 12h10" /></svg>
                                                {flat.tot_bedrooms}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6l-2.5-2.5a1.5 1.5 0 00-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 002 2h12a2 2 0 002-2v-5" /></svg>
                                                {flat.tot_washrooms}
                                            </span>
                                            <span className="flex items-center gap-1.5 ml-auto text-xs">
                                                {flat.flat_size} sqft
                                            </span>
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
