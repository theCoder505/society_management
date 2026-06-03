import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AppHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        const darkThemeSelected = document.documentElement.classList.contains('dark');
        setIsDark(darkThemeSelected);
    }, []);

    const toggleTheme = () => {
        const htmlClasses = document.documentElement.classList;
        if (htmlClasses.contains('dark')) {
            htmlClasses.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            htmlClasses.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Apartments', href: '/apartments/all' },
        { label: 'Flats', href: '/flats' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    const isActive = (href: string) => url === href || (href !== '/' && url.startsWith(href));

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#E2DFD4] dark:border-[#2A2A26] bg-[#FAFAF7]/90 dark:bg-[#0E0E0C]/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                            <img
                                src="/assets/logo.png"
                                alt="Logo"
                                className="w-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                                        '<span class="text-[#A8C09A] font-bold text-sm">S</span>';
                                }}
                            />
                        </div>
                        <div className="leading-tight">
                            <span className="block text-[15px] font-semibold text-[#1C2B1A] dark:text-[#E8E4DA] uppercase">
                                Society
                            </span>
                            <span className="block text-[10px] uppercase tracking-[0.15em] text-[#7A7A6E] dark:text-[#6A6A60] font-medium -mt-0.5">
                                Management
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                                    isActive(link.href)
                                        ? 'bg-[#1C2B1A] text-[#E8E4DA] dark:bg-[#2E4A2B] dark:text-[#C5DFB8]'
                                        : 'text-[#4A4A40] dark:text-[#9A9A8A] hover:text-[#1C2B1A] dark:hover:text-[#E8E4DA] hover:bg-[#EDEAE0] dark:hover:bg-[#1E1E1A]'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[#4A4A40] dark:text-[#9A9A8A] hover:bg-[#EDEAE0] dark:hover:bg-[#1E1E1A] transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <Link
                            href="/login"
                            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-[#C8C5B8] dark:border-[#3A3A34] text-[#1C2B1A] dark:text-[#E8E4DA] hover:bg-[#EDEAE0] dark:hover:bg-[#1E1E1A] transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/tenant/dashboard"
                            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-[#1C2B1A] dark:bg-[#2E4A2B] text-[#E8E4DA] hover:bg-[#263B23] dark:hover:bg-[#3A5E36] transition-colors shadow-sm"
                        >
                            Portal →
                        </Link>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-[#EDEAE0] dark:hover:bg-[#1E1E1A] transition-colors text-[#4A4A40] dark:text-[#9A9A8A]"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-[#E2DFD4] dark:border-[#2A2A26] bg-[#FAFAF7] dark:bg-[#0E0E0C] px-4 py-3 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive(link.href)
                                    ? 'bg-[#1C2B1A] text-[#E8E4DA]'
                                    : 'text-[#4A4A40] dark:text-[#9A9A8A] hover:bg-[#EDEAE0] dark:hover:bg-[#1E1E1A]'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2 flex flex-col gap-2">
                        <Link href="/login" className="block text-center px-4 py-2 text-sm font-medium rounded-lg border border-[#C8C5B8] dark:border-[#3A3A34] text-[#1C2B1A] dark:text-[#E8E4DA]">
                            Sign In
                        </Link>
                        <Link href="/tenant/dashboard" className="block text-center px-4 py-2 text-sm font-medium rounded-lg bg-[#1C2B1A] text-[#E8E4DA]">
                            Portal →
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}