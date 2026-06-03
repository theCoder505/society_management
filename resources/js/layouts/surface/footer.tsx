import { Link, usePage } from '@inertiajs/react';

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
};

export default function AppFooter() {
    const { props } = usePage<{ settings?: Settings }>();
    const settings = props.settings;

    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: 'Home', href: '/' },
        { label: 'Apartments', href: '/apartments' },
        { label: 'Available Flats', href: '/flats' },
        { label: 'About Us', href: '/about' },
    ];

    const portalLinks = [
        { label: 'Tenant Portal', href: '/tenant/dashboard' },
        { label: 'Owner Portal', href: '/owner/dashboard' },
        { label: 'Admin Panel', href: '/admin' },
        { label: 'Sign In', href: '/login' },
    ];

    const legalLinks = [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms-conditions' },
    ];

    return (
        <footer className="bg-[#131410] text-[#B0AD9E] border-t border-[#2A2A24]">
            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-[#2E4A2B] flex items-center justify-center overflow-hidden">
                                <img
                                    src={settings?.brand_logo || '/assets/logo.png'}
                                    alt="Logo"
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                                            '<span style="color:#A8C09A;font-weight:700;font-size:14px">S</span>';
                                    }}
                                />
                            </div>
                            <div className="leading-tight">
                                <span className="block text-[15px] font-semibold text-[#E8E4DA]">
                                    {settings?.brand_name || 'Society Management'}
                                </span>
                                <span className="block text-[10px] uppercase tracking-[0.15em] text-[#5A5A50] font-medium -mt-0.5">
                                    Premium Living
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed text-[#7A7A6C] mb-5 max-w-[220px]">
                            Modern society management for residents, owners, and administrators.
                        </p>
                        {/* Social links */}
                        <div className="flex items-center gap-3">
                            {settings?.facebook && (
                                <a href={settings.facebook} target="_blank" rel="noreferrer"
                                    className="w-8 h-8 rounded-lg border border-[#2A2A24] flex items-center justify-center text-[#7A7A6C] hover:text-[#E8E4DA] hover:border-[#3A3A34] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                    </svg>
                                </a>
                            )}
                            {settings?.instagram && (
                                <a href={settings.instagram} target="_blank" rel="noreferrer"
                                    className="w-8 h-8 rounded-lg border border-[#2A2A24] flex items-center justify-center text-[#7A7A6C] hover:text-[#E8E4DA] hover:border-[#3A3A34] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                    </svg>
                                </a>
                            )}
                            {settings?.twitter && (
                                <a href={settings.twitter} target="_blank" rel="noreferrer"
                                    className="w-8 h-8 rounded-lg border border-[#2A2A24] flex items-center justify-center text-[#7A7A6C] hover:text-[#E8E4DA] hover:border-[#3A3A34] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                    </svg>
                                </a>
                            )}
                            {settings?.linkedin && (
                                <a href={settings.linkedin} target="_blank" rel="noreferrer"
                                    className="w-8 h-8 rounded-lg border border-[#2A2A24] flex items-center justify-center text-[#7A7A6C] hover:text-[#E8E4DA] hover:border-[#3A3A34] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#E8E4DA] mb-4">Explore</h4>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}
                                        className="text-sm text-[#7A7A6C] hover:text-[#C5DFB8] transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Portals */}
                    <div>
                        <h4 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#E8E4DA] mb-4">Portals</h4>
                        <ul className="space-y-2.5">
                            {portalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}
                                        className="text-sm text-[#7A7A6C] hover:text-[#C5DFB8] transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#E8E4DA] mb-4">Contact</h4>
                        <div className="space-y-3">
                            {settings?.contact_email && (
                                <a href={`mailto:${settings.contact_email}`}
                                    className="flex items-start gap-2.5 text-sm text-[#7A7A6C] hover:text-[#C5DFB8] transition-colors group">
                                    <svg className="w-4 h-4 mt-0.5 shrink-0 group-hover:text-[#A8C09A]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                    {settings.contact_email}
                                </a>
                            )}
                            {settings?.location && settings.location !== 'demo' && (
                                <div className="flex items-start gap-2.5 text-sm text-[#7A7A6C]">
                                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    {settings.location}
                                </div>
                            )}
                            <div className="flex items-start gap-2.5 text-sm text-[#7A7A6C]">
                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1H6.6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                Available 9AM – 6PM
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#1E1E1A] py-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-[#4A4A40]">
                        © {currentYear} {settings?.brand_name || 'Society Management'}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {legalLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                className="text-xs text-[#4A4A40] hover:text-[#7A7A6C] transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}