import AppHeader from '@/layouts/surface/header';
import AppFooter from '@/layouts/surface/footer';
import { PropsWithChildren } from 'react';

export default function SurfaceApp({ children }: PropsWithChildren) {
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