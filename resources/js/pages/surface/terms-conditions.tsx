import SurfaceApp from '@/layouts/surface/app';
import { Head } from '@inertiajs/react';

type Settings = {
    brand_name?: string;
    terms_conditions?: string;
    location?: string;
    contact_email?: string;
};
interface Props {
    settings: Settings;
}

export default function TermsConditions({ settings }: Props) {
    const brand = settings?.brand_name || 'Society Management';

    return (
        <SurfaceApp>
            <Head title={`${brand} — Terms & Conditions`} />

            <div className="border-b border-[#E2DFD4] bg-[#FAFAF7] px-4 py-16 dark:border-[#2A2A24] dark:bg-[#0E0E0C]">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">Terms & Conditions</h1>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-16">
                {settings?.terms_conditions ? (
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none text-[#5A5A50] dark:text-[#9A9A8A]"
                        dangerouslySetInnerHTML={{ __html: settings.terms_conditions }}
                    />
                ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none text-[#5A5A50] dark:text-[#9A9A8A]">
                        <p>
                            Welcome to {brand}. By accessing and using our website and services, you agree to comply with and be bound by the
                            following terms and conditions.
                        </p>

                        <h2 className="mt-8 mb-4 text-2xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">1. Acceptance of Terms</h2>
                        <p>
                            By registering for a tenant or owner account, or simply browsing our surface web, you acknowledge that you have read,
                            understood, and agree to be bound by these Terms. If you do not agree, please do not use our services.
                        </p>

                        <h2 className="mt-8 mb-4 text-2xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">2. User Responsibilities</h2>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You agree to provide accurate and complete information when interacting with our platform.</li>
                            <li>You must not use the platform for any unlawful or prohibited activities.</li>
                        </ul>

                        <h2 className="mt-8 mb-4 text-2xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">3. Payments and Billing</h2>
                        <p>
                            All rent payments, maintenance fees, and other charges processed through this platform are subject to verification. Users
                            must ensure that payment methods are valid and authorized.
                        </p>

                        <h2 className="mt-8 mb-4 text-2xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">4. Modifications to Service</h2>
                        <p>
                            We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or
                            without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of
                            the service.
                        </p>

                        <h2 className="mt-8 mb-4 text-2xl font-bold text-[#1C2B1A] dark:text-[#E8E4DA]">5. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which {brand}{' '}
                            operates.
                        </p>
                    </div>
                )}
            </div>
        </SurfaceApp>
    );
}
