import SurfaceApp from '@/layouts/surface/app';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import React from 'react';
import FlashMessage from '../FlashMessage';
import Swal from 'sweetalert2';

type FlatOption = {
    flatID: string;
    flat_type: string;
    rent_price: string;
    flat_price: string;
};

interface ContactProps {
    settings: any;
    flats: FlatOption[];
}

export default function SurfaceContact({ settings, flats = [] }: ContactProps) {
    const contactForm = useForm({
        name: '',
        email: '',
        contact: '',
        type: 'other',
        flat_id: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contactForm.post('/contact', {
            onSuccess: () => {
                contactForm.reset();
                Swal.fire({
                    title: 'Message Sent!',
                    text: 'Your inquiry has been submitted. The society lead will get in touch with you shortly.',
                    icon: 'success',
                    confirmButtonColor: '#2E5A28',
                    background: document.documentElement.classList.contains('dark') ? '#141412' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#E8E4DA' : '#1C2B1A',
                });
            },
            preserveScroll: true,
        });
    };

    const inputClass =
        'w-full px-4 py-2.5 rounded-lg border border-[#C8C5B8] bg-white text-[#1C2B1A] placeholder-[#B0AFA5] dark:border-[#3A3A34] dark:bg-[#141412] dark:text-[#E8E4DA] dark:placeholder-[#4A4A40] focus:outline-none focus:ring-2 focus:ring-[#B0C8A8] transition';

    const labelClass = 'block text-sm font-medium text-[#4A4A3C] dark:text-[#9A9A8A] mb-1.5';

    return (
        <SurfaceApp>
            <Head title="Contact Us" />
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="grid items-start gap-12 lg:grid-cols-2">
                    {/* LEFT — Form */}
                    <div>
                        <div className="">
                            <h1 className="mb-2 text-3xl font-bold text-[#1C2B1A] md:text-4xl dark:text-[#E8E4DA]">Get In Touch</h1>
                            <p className="text-[#7A7A6C] dark:text-[#6A6A60]">Have a question or enquiry? We'd love to hear from you.</p>
                        </div>

                        <div className="pt-8 dark:border-[#2A2A24]">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className={labelClass}>
                                        Your Name
                                    </label>
                                    <input
                                        id="name"
                                        required
                                        value={contactForm.data.name}
                                        onChange={(e) => contactForm.setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        className={inputClass}
                                    />
                                    {contactForm.errors.name && <p className="mt-1 text-sm text-red-500">{contactForm.errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="email" className={labelClass}>
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={contactForm.data.email}
                                            onChange={(e) => contactForm.setData('email', e.target.value)}
                                            placeholder="you@example.com"
                                            className={inputClass}
                                        />
                                        {contactForm.errors.email && <p className="mt-1 text-sm text-red-500">{contactForm.errors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="contact" className={labelClass}>
                                            Phone Number
                                        </label>
                                        <input
                                            id="contact"
                                            required
                                            value={contactForm.data.contact}
                                            onChange={(e) => contactForm.setData('contact', e.target.value)}
                                            placeholder="+1 234 567 890"
                                            className={inputClass}
                                        />
                                        {contactForm.errors.contact && <p className="mt-1 text-sm text-red-500">{contactForm.errors.contact}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="type" className={labelClass}>
                                            Inquiry Type
                                        </label>
                                        <select
                                            id="type"
                                            required
                                            value={contactForm.data.type}
                                            onChange={(e) => contactForm.setData('type', e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="other">General Inquiry</option>
                                            <option value="purchase">Purchase a Flat</option>
                                            <option value="rent">Rent a Flat</option>
                                        </select>
                                        {contactForm.errors.type && <p className="mt-1 text-sm text-red-500">{contactForm.errors.type}</p>}
                                    </div>

                                    {(contactForm.data.type === 'purchase' || contactForm.data.type === 'rent') && (
                                        <div>
                                            <label htmlFor="flat_id" className={labelClass}>
                                                Interested In (Optional)
                                            </label>
                                            <select
                                                id="flat_id"
                                                value={contactForm.data.flat_id}
                                                onChange={(e) => contactForm.setData('flat_id', e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Any available flat</option>
                                                {flats.map((flat) => (
                                                    <option key={flat.flatID} value={flat.flatID}>
                                                        {flat.flatID} ({flat.flat_type === 'to_rent' ? 'For Rent' : 'For Sale'})
                                                    </option>
                                                ))}
                                            </select>
                                            {contactForm.errors.flat_id && <p className="mt-1 text-sm text-red-500">{contactForm.errors.flat_id}</p>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="message" className={labelClass}>
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        required
                                        value={contactForm.data.message}
                                        onChange={(e) => contactForm.setData('message', e.target.value)}
                                        placeholder="Tell us how we can help..."
                                        className={`${inputClass} resize-none`}
                                    />
                                    {contactForm.errors.message && <p className="mt-1 text-sm text-red-500">{contactForm.errors.message}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={contactForm.processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2E5A28] px-6 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-[#3A7032] focus:ring-2 focus:ring-[#B0C8A8] focus:ring-offset-2 focus:outline-none disabled:opacity-60"
                                >
                                    {contactForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT — Image */}
                    <div className="hidden lg:block">
                        <div className="relative items-center justify-center overflow-hidden rounded-2xl border border-[#E2DFD4] shadow-sm dark:border-[#2A2A24]">
                            <img
                                src="/assets/contact.jpg"
                                alt="Modern office workspace"
                                className="h-[560px] w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                                }}
                            />
                            {/* Subtle overlay with tagline */}
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#1C2B1A]/80 via-transparent to-transparent p-8">
                                <div>
                                    <p className="mb-1 text-xl leading-snug font-semibold text-white">We're here to help</p>
                                    <p className="text-sm text-[#A8C09A]">Our team typically responds within 24 hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SurfaceApp>
    );
}
