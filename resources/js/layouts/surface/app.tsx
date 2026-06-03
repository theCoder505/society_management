import AppHeader from '@/layouts/surface/header';
import AppFooter from '@/layouts/surface/footer';
import { PropsWithChildren, useEffect } from 'react';

export default function SurfaceApp({ children }: PropsWithChildren) {
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        // Default to dark if no preference is saved
        const isDark = saved ? saved === 'dark' : true;
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Persist the default so other pages stay consistent
        if (!saved) {
            localStorage.setItem('theme', 'dark');
        }
    }, []);

    return (
        <div className="surface-layout min-h-screen flex flex-col bg-[#F7F6F2] dark:bg-[#0E0E0C] font-['Fraunces',serif]">
            <AppHeader />
            <main className="flex-1">
                {children}
            </main>
            <AppFooter />
        </div>
    );
}