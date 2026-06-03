import SurfaceApp from '@/layouts/surface/app';
import { Head } from '@inertiajs/react';

type Settings = {
    brand_name?: string;
    about?: string;
    location?: string;
    contact_email?: string;
};

interface Props {
    settings: Settings;
}

export default function About({ settings }: Props) {
    return (
        <SurfaceApp>
            <Head title={`${settings?.brand_name || 'Society Management'} — About Us`} />
            
            <div className="bg-[#1C2B1A] dark:bg-[#0E150D] py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Us</h1>
                    <p className="text-emerald-100 text-xl leading-relaxed">
                        Setting the standard for premium residential living and seamless society management.
                    </p>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0E0E0C]">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="bg-white dark:bg-[#141412] rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-[#2A2A24]">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-[#E8E4DA] mb-6">Who We Are</h2>
                        
                        {settings?.about ? (
                            <div 
                                className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-[#9A9A8A] leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: settings.about }}
                            />
                        ) : (
                            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-[#9A9A8A] leading-relaxed">
                                <p>
                                    Welcome to <strong>{settings?.brand_name || 'Society Management'}</strong>, where luxury meets convenience. 
                                    We are dedicated to providing a premium living experience across all our residential properties.
                                </p>
                                <p>
                                    Our platform seamlessly bridges the gap between residents, flat owners, and administrators, ensuring that everything from rent payments to service requests and community announcements are handled with efficiency and transparency.
                                </p>
                                <p>
                                    Experience the future of society management and real estate operations, tailored for modern, upscale communities.
                                </p>
                            </div>
                        )}

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 dark:border-[#2A2A24] pt-8">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#E8E4DA] mb-2">Our Mission</h3>
                                <p className="text-slate-600 dark:text-[#9A9A8A]">To deliver unparalleled residential management services that foster secure, vibrant, and well-maintained communities.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#E8E4DA] mb-2">Contact Details</h3>
                                <p className="text-slate-600 dark:text-[#9A9A8A]">
                                    {settings?.location && <span className="block mb-1">{settings.location}</span>}
                                    {settings?.contact_email && <a href={`mailto:${settings.contact_email}`} className="text-emerald-700 dark:text-[#A8C09A] hover:underline">{settings.contact_email}</a>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SurfaceApp>
    );
}
