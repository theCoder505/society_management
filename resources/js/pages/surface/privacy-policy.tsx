import SurfaceApp from '@/layouts/surface/app';
import { Head } from '@inertiajs/react';

type Settings = {
    brand_name?: string;
    privacy_policy?: string;
    location?: string;
    contact_email?: string;
};

interface Props {
    settings: Settings;
}

export default function PrivacyPolicy({ settings }: Props) {
    const brand = settings?.brand_name || 'Society Management';
    
    return (
        <SurfaceApp>
            <Head title={`${brand} — Privacy Policy`} />
            
            {/* Hero header */}
            <div className="bg-[#1C2B1A] dark:bg-[#0E150D] py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <p className="text-emerald-300 text-sm font-semibold tracking-widest uppercase mb-3">Legal</p>
                    <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
                    <p className="text-emerald-100/70 mt-3 text-lg">How we collect, use, and protect your information.</p>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0E0E0C]">
                <div className="max-w-3xl mx-auto px-4 py-16">
                    <div className="bg-white dark:bg-[#141412] rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-[#2A2A24]">
                        {settings?.privacy_policy ? (
                            <div 
                                className="prose prose-lg prose-headings:text-slate-900 prose-p:text-slate-600 dark:prose-invert max-w-none dark:prose-headings:text-[#E8E4DA] dark:prose-p:text-[#9A9A8A]"
                                dangerouslySetInnerHTML={{ __html: settings.privacy_policy }}
                            />
                        ) : (
                        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-[#9A9A8A]">
                            <p>At {brand}, we take your privacy seriously. This Privacy Policy outlines the types of personal information we collect, how we use it, and the steps we take to ensure your data is protected.</p>
                            
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-[#E8E4DA] mt-8 mb-4">1. Information We Collect</h2>
                            <p>We collect information you provide directly to us when you create an account, update your profile, submit a contact form, or make a payment. This may include your name, email address, phone number, and billing information.</p>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-[#E8E4DA] mt-8 mb-4">2. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide, maintain, and improve our residential management services.</li>
                                <li>Process transactions and send related information, including confirmations and invoices.</li>
                                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                                <li>Respond to your comments, questions, and requests.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-[#E8E4DA] mt-8 mb-4">3. Data Security</h2>
                            <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-[#E8E4DA] mt-8 mb-4">4. Contact Us</h2>
                            <p>If you have any questions about this Privacy Policy, please contact our administration team through the Contact page.</p>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </SurfaceApp>
    );
}
