import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { Megaphone, AlertCircle, CheckCircle2, ClipboardList, Info, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notice Board',
        href: '/tenant/notices',
    },
];

interface Announcement {
    id: number;
    title: string;
    announcement_details: string;
    created_at: string;
}

interface Notice {
    id: number;
    notice_uid: string;
    title: string;
    notice_details: string;
    is_complied: boolean;
    complied_at: string | null;
    created_at: string;
}

interface NoticesProps {
    notices: Notice[];
    announcements: Announcement[];
}

export default function TenantNotices({ notices, announcements }: NoticesProps) {
    const handleComply = (id: number) => {
        router.post('/tenant/notices/comply', { id }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notice Board" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Notice Board & Announcements</h1>
                    <p className="text-muted-foreground text-sm">Stay updated with landlord notices and official building broadcasts</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Notices Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 mb-2 dark:border-neutral-800">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Personal Landlord Notices</h2>
                        </div>

                        {notices.length > 0 ? (
                            notices.map((notice) => (
                                <div 
                                    key={notice.id} 
                                    className={`border rounded-xl p-5 shadow-xs transition-all relative ${
                                        notice.is_complied 
                                            ? 'bg-card border-border' 
                                            : 'bg-amber-50/20 border-amber-200 dark:border-amber-900/50'
                                    }`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                {notice.is_complied ? (
                                                    <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                                                )}
                                                <h3 className="font-semibold text-foreground text-base leading-tight">
                                                    {notice.title}
                                                </h3>
                                            </div>
                                            <span className="text-xs font-mono text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded">
                                                {notice.notice_uid}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                            {notice.notice_details}
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 border-border/50">
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Issued on {new Date(notice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>

                                            {notice.is_complied ? (
                                                <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                                    Complied on {new Date(notice.complied_at!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </span>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleComply(notice.id)}
                                                    className="border-amber-200 dark:border-amber-900 hover:bg-amber-100/30 text-xs py-1 h-8"
                                                >
                                                    Mark as Complied
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground text-sm dark:border-neutral-800">
                                <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                You have no personal notices at this time.
                            </div>
                        )}
                    </div>

                    {/* Announcements Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2 mb-2 dark:border-neutral-800">
                            <Megaphone className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Society Broadcasts</h2>
                        </div>

                        {announcements.length > 0 ? (
                            announcements.map((ann) => (
                                <div key={ann.id} className="bg-card rounded-xl border p-5 shadow-xs dark:border-neutral-800 flex gap-3">
                                    <div className="rounded-full bg-primary/10 text-primary p-2 h-fit shrink-0">
                                        <Megaphone className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1 gap-2">
                                            <p className="text-sm font-bold text-foreground truncate">{ann.title}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {ann.announcement_details}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground mt-2 block font-mono">
                                            {new Date(ann.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground text-sm dark:border-neutral-800">
                                No society announcements recorded.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
