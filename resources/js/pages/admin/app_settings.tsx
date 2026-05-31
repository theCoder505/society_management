import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

// ---------- Types ----------
interface AppSettingData {
    id: number;
    brand_name: string;
    brand_logo: string | null;
    brand_icon: string | null;
    location: string | null;
    gogle_map: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    contact_email: string | null;
    about: string | null;
    privacy_policy: string | null;
    terms_conditions: string | null;
}

interface PageProps {
    settings: AppSettingData;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

// ---------- Rich Text Editor (Tiptap-style pure JS minimal editor) ----------
function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (editorRef.current && !isInitialized.current) {
            editorRef.current.innerHTML = value || '';
            isInitialized.current = true;
        }
    }, []);

    const exec = (cmd: string, arg?: string) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, arg);
        onChange(editorRef.current?.innerHTML || '');
    };

    const toolbarBtn = (label: string, action: () => void, title: string) => (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => {
                e.preventDefault();
                action();
            }}
            className="rounded border border-transparent bg-transparent px-2 py-1 text-xs font-semibold transition-colors hover:border-gray-200 hover:bg-white"
        >
            {label}
        </button>
    );

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100">
            <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 p-2 text-black">
                {toolbarBtn('B', () => exec('bold'), 'Bold')}
                {toolbarBtn('I', () => exec('italic'), 'Italic')}
                {toolbarBtn('U', () => exec('underline'), 'Underline')}
                {toolbarBtn('S', () => exec('strikeThrough'), 'Strikethrough')}
                <span className="mx-1 w-px self-stretch bg-gray-200" />
                {toolbarBtn('H1', () => exec('formatBlock', 'h1'), 'Heading 1')}
                {toolbarBtn('H2', () => exec('formatBlock', 'h2'), 'Heading 2')}
                {toolbarBtn('H3', () => exec('formatBlock', 'h3'), 'Heading 3')}
                {toolbarBtn('P', () => exec('formatBlock', 'p'), 'Paragraph')}
                <span className="mx-1 w-px self-stretch bg-gray-200" />
                {toolbarBtn('• List', () => exec('insertUnorderedList'), 'Bullet List')}
                {toolbarBtn('1. List', () => exec('insertOrderedList'), 'Numbered List')}
                <span className="mx-1 w-px self-stretch bg-gray-200" />
                {toolbarBtn(
                    'Link',
                    () => {
                        const url = prompt('Enter URL');
                        if (url) exec('createLink', url);
                    },
                    'Insert Link',
                )}
                {toolbarBtn('Unlink', () => exec('unlink'), 'Remove Link')}
                <span className="mx-1 w-px self-stretch bg-gray-200" />
                {toolbarBtn('Undo', () => exec('undo'), 'Undo')}
                {toolbarBtn('Redo', () => exec('redo'), 'Redo')}
            </div>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="prose prose-sm min-h-[180px] max-w-none bg-white p-3 text-sm leading-relaxed text-gray-900 outline-none"
                data-placeholder={placeholder}
                onInput={() => onChange(editorRef.current?.innerHTML || '')}
                onBlur={() => onChange(editorRef.current?.innerHTML || '')}
            />
        </div>
    );
}

// ---------- Image Upload Field ----------
function ImageUploadField({
    label,
    name,
    currentUrl,
    onChange,
    error,
}: {
    label: string;
    name: string;
    currentUrl: string | null;
    onChange: (file: File) => void;
    error?: string;
}) {
    const [preview, setPreview] = useState<string | null>(currentUrl);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
        onChange(file);
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-400">{label}</label>
            <div
                className="relative flex min-h-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-indigo-600 hover:bg-indigo-50/30 dark:bg-transparent dark:text-gray-100"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFile(file);
                }}
            >
                {preview ? (
                    <div className="relative flex min-h-[140px] w-full items-center justify-center">
                        <img src={preview} alt="Preview" className="max-h-[140px] max-w-full object-contain p-3" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                            Click or drop to replace
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 p-6 text-center text-gray-400">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <p className="m-0 text-sm font-medium text-gray-700">Click or drag PNG image here</p>
                        <span className="text-xs">PNG only · Max 10 MB</span>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept="image/png"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

// ---------- Section Card ----------
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-900 dark:bg-transparent">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3 dark:bg-transparent">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">{icon}</span>
                <h2 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-200">{title}</h2>
            </div>
            <div className="flex flex-col gap-3 p-5">{children}</div>
        </div>
    );
}

// ---------- Input Field ----------
function InputField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
}: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={name} className="text-xs font-semibold text-gray-700 dark:text-gray-400">
                {label}
            </label>
            <input
                id={name}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-sm text-gray-900 transition-colors outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 dark:bg-transparent dark:text-gray-100 ${
                    error ? 'border-red-500' : 'border-gray-200'
                }`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

// ---------- Google Maps Iframe Field ----------
function GoogleMapsField({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={name} className="text-xs font-semibold text-gray-700 dark:text-gray-400">
                {label}
            </label>
            <textarea
                id={name}
                name={name}
                value={value}
                placeholder={placeholder}
                rows={3}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-lg border-2 bg-white px-3 py-2 font-mono text-sm text-gray-900 transition-colors outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 dark:bg-transparent dark:text-gray-100 ${
                    error ? 'border-red-500' : 'border-gray-200'
                }`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* Live Preview of the iframe */}
            {value && value.trim() && (
                <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-400">Preview:</p>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <iframe
                            srcDoc={value}
                            title="Google Maps Preview"
                            className="h-[300px] w-full border-0"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                </div>
            )}

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Paste the full Google Maps iframe embed code here. Example: {'<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'}
            </p>
        </div>
    );
}

// ---------- Breadcrumbs ----------
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'App Settings',
        href: '/admin/app-settings',
    },
];

// ---------- Main Page ----------
export default function AppSettings() {
    const { settings, flash } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm<{
        brand_name: string;
        brand_logo: File | null;
        brand_icon: File | null;
        location: string;
        gogle_map: string;
        facebook: string;
        instagram: string;
        twitter: string;
        linkedin: string;
        contact_email: string;
        about: string;
        privacy_policy: string;
        terms_conditions: string;
        _method: string;
    }>({
        brand_name: settings?.brand_name || '',
        brand_logo: null,
        brand_icon: null,
        location: settings?.location || '',
        gogle_map: settings?.gogle_map || '',
        facebook: settings?.facebook || '',
        instagram: settings?.instagram || '',
        twitter: settings?.twitter || '',
        linkedin: settings?.linkedin || '',
        contact_email: settings?.contact_email || '',
        about: settings?.about || '',
        privacy_policy: settings?.privacy_policy || '',
        terms_conditions: settings?.terms_conditions || '',
        _method: 'POST',
    });

    // Flash messages via SweetAlert2
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                text: flash.success,
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                customClass: { popup: 'swal-toast-popup' },
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: flash.error,
                confirmButtonColor: '#4f46e5',
            });
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
            onSuccess: () => {},
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please fix the errors in the form.',
                    confirmButtonColor: '#4f46e5',
                });
            },
        });
    };

    const handleReset = () => {
        Swal.fire({
            title: 'Reset changes?',
            text: 'Unsaved changes will be lost.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, reset',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
        }).then((result) => {
            if (result.isConfirmed) {
                reset();
                window.location.reload();
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Settings" />

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mx-auto flex flex-col gap-6 p-6">
                    {/* ── Page Header ── */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">App Settings</h1>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-300">
                                Manage your application brand, contact, and content settings.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:text-gray-200"
                                onClick={handleReset}
                                disabled={processing}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 .49-3" />
                                </svg>
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{' '}
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Branding ── */}
                    <SectionCard
                        title="Branding"
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1="9" y1="9" x2="9.01" y2="9" />
                                <line x1="15" y1="9" x2="15.01" y2="9" />
                            </svg>
                        }
                    >
                        <InputField
                            label="Brand Name *"
                            name="brand_name"
                            value={data.brand_name}
                            onChange={(v) => setData('brand_name', v)}
                            error={errors.brand_name}
                            placeholder="e.g. Acme Corp"
                        />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <ImageUploadField
                                label="Brand Logo (PNG)"
                                name="brand_logo"
                                currentUrl={settings?.brand_logo || null}
                                onChange={(file) => setData('brand_logo', file)}
                                error={errors.brand_logo}
                            />
                            <ImageUploadField
                                label="Brand Icon (PNG)"
                                name="brand_icon"
                                currentUrl={settings?.brand_icon || null}
                                onChange={(file) => setData('brand_icon', file)}
                                error={errors.brand_icon}
                            />
                        </div>
                    </SectionCard>

                    {/* ── Contact & Location ── */}
                    <SectionCard
                        title="Contact & Location"
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        }
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputField
                                label="Contact Email"
                                name="contact_email"
                                type="email"
                                value={data.contact_email}
                                onChange={(v) => setData('contact_email', v)}
                                error={errors.contact_email}
                                placeholder="hello@company.com"
                            />
                            <InputField
                                label="Location"
                                name="location"
                                value={data.location}
                                onChange={(v) => setData('location', v)}
                                error={errors.location}
                                placeholder="123 Main St, City, Country"
                            />
                        </div>

                        {/* Google Maps Iframe Field */}
                        <GoogleMapsField
                            label="Google Maps Embed"
                            name="gogle_map"
                            value={data.gogle_map}
                            onChange={(v) => setData('gogle_map', v)}
                            error={errors.gogle_map}
                            placeholder={`<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`}
                        />
                    </SectionCard>

                    {/* ── Social Media ── */}
                    <SectionCard
                        title="Social Media"
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        }
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputField
                                label="Facebook"
                                name="facebook"
                                value={data.facebook}
                                onChange={(v) => setData('facebook', v)}
                                error={errors.facebook}
                                placeholder="https://facebook.com/yourpage"
                            />
                            <InputField
                                label="Instagram"
                                name="instagram"
                                value={data.instagram}
                                onChange={(v) => setData('instagram', v)}
                                error={errors.instagram}
                                placeholder="https://instagram.com/yourhandle"
                            />
                            <InputField
                                label="Twitter / X"
                                name="twitter"
                                value={data.twitter}
                                onChange={(v) => setData('twitter', v)}
                                error={errors.twitter}
                                placeholder="https://twitter.com/yourhandle"
                            />
                            <InputField
                                label="LinkedIn"
                                name="linkedin"
                                value={data.linkedin}
                                onChange={(v) => setData('linkedin', v)}
                                error={errors.linkedin}
                                placeholder="https://linkedin.com/company/yourco"
                            />
                        </div>
                    </SectionCard>

                    {/* ── About ── */}
                    <SectionCard
                        title="About"
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        }
                    >
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-400">About Content</label>
                            <RichTextEditor value={data.about} onChange={(v) => setData('about', v)} placeholder="Write about your company…" />
                            {errors.about && <p className="mt-1 text-xs text-red-500">{errors.about}</p>}
                        </div>
                    </SectionCard>

                    {/* ── Privacy Policy ── */}
                    <SectionCard
                        title="Privacy Policy"
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        }
                    >
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-400">Privacy Policy Content</label>
                            <RichTextEditor
                                value={data.privacy_policy}
                                onChange={(v) => setData('privacy_policy', v)}
                                placeholder="Write your privacy policy…"
                            />
                            {errors.privacy_policy && <p className="mt-1 text-xs text-red-500">{errors.privacy_policy}</p>}
                        </div>
                    </SectionCard>

                    {/* ── Terms & Conditions ── */}
                    <SectionCard
                        title="Terms & Conditions"
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        }
                    >
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-400">Terms & Conditions Content</label>
                            <RichTextEditor
                                value={data.terms_conditions}
                                onChange={(v) => setData('terms_conditions', v)}
                                placeholder="Write your terms and conditions…"
                            />
                            {errors.terms_conditions && <p className="mt-1 text-xs text-red-500">{errors.terms_conditions}</p>}
                        </div>
                    </SectionCard>

                    {/* ── Bottom Save Bar ── */}
                    <div className="flex justify-end pb-4">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:text-gray-100"
                                onClick={handleReset}
                                disabled={processing}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />{' '}
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
