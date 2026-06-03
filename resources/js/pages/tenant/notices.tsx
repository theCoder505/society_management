import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Megaphone, AlertCircle, CheckCircle2, ClipboardList, Info, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const ITEMS_PER_PAGE = 10;

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-border/50 dark:border-neutral-800">
            <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{startItem}–{endItem}</span> of{' '}
                <span className="font-medium text-foreground">{totalItems}</span> items
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers().map((page, idx) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm select-none">…</span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 text-xs"
                            onClick={() => onPageChange(page)}
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </Button>
                    )
                )}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default function TenantNotices({ notices, announcements }: NoticesProps) {
    const [noticePage, setNoticePage] = useState(1);
    const [announcementPage, setAnnouncementPage] = useState(1);

    const noticeTotalPages = Math.ceil(notices.length / ITEMS_PER_PAGE);
    const announcementTotalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);

    const paginatedNotices = notices.slice(
        (noticePage - 1) * ITEMS_PER_PAGE,
        noticePage * ITEMS_PER_PAGE
    );

    const paginatedAnnouncements = announcements.slice(
        (announcementPage - 1) * ITEMS_PER_PAGE,
        announcementPage * ITEMS_PER_PAGE
    );

    const handleComply = (id: number) => {
        router.post('/tenant/notices/comply', { id }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notice Board" />

            <div className="flex flex-col gap-4 p-4 md:p-6">
                <FlashMessage />

                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Notice Board & Announcements</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Stay updated with landlord notices and official building broadcasts</p>
                </div>

                <Tabs defaultValue="notices" className="w-full">
                    <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-10 mb-4 max-w-md">
                        <TabsTrigger value="notices" className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                            <span>Landlord Notices</span>
                            {notices.length > 0 && (
                                <span className="ml-1 bg-primary/15 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                    {notices.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <Megaphone className="h-3.5 w-3.5 shrink-0" />
                            <span>Society Notices</span>
                            {announcements.length > 0 && (
                                <span className="ml-1 bg-primary/15 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
                                    {announcements.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Landlord Notices Tab */}
                    <TabsContent value="notices" className="mt-0 space-y-3">
                        {notices.length > 0 ? (
                            <>
                                {paginatedNotices.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className={`border rounded-xl p-4 sm:p-5 shadow-xs transition-all ${
                                            notice.is_complied
                                                ? 'bg-card border-border'
                                                : 'bg-amber-50/20 border-amber-200 dark:border-amber-900/50'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {notice.is_complied ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                                    )}
                                                    <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight truncate">
                                                        {notice.title}
                                                    </h3>
                                                </div>
                                                <span className="text-[10px] sm:text-xs font-mono text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded">
                                                    {notice.notice_uid}
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {notice.notice_details}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-3 border-border/50">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Issued {new Date(notice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>

                                                {notice.is_complied ? (
                                                    <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Complied on {new Date(notice.complied_at!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleComply(notice.id)}
                                                        className="border-amber-200 dark:border-amber-900 hover:bg-amber-100/30 text-xs h-7"
                                                    >
                                                        Mark as Complied
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Pagination
                                    currentPage={noticePage}
                                    totalPages={noticeTotalPages}
                                    onPageChange={(page) => {
                                        setNoticePage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    totalItems={notices.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                />
                            </>
                        ) : (
                            <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground text-sm dark:border-neutral-800">
                                <Info className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                You have no personal notices at this time.
                            </div>
                        )}
                    </TabsContent>

                    {/* Society Announcements Tab */}
                    <TabsContent value="announcements" className="mt-0 space-y-3">
                        {announcements.length > 0 ? (
                            <>
                                {paginatedAnnouncements.map((ann) => (
                                    <div key={ann.id} className="bg-card rounded-xl border p-4 sm:p-5 shadow-xs dark:border-neutral-800 flex gap-3">
                                        <div className="rounded-full bg-primary/10 text-primary p-2 h-fit shrink-0">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground">{ann.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                {ann.announcement_details}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground mt-2 block font-mono">
                                                {new Date(ann.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <Pagination
                                    currentPage={announcementPage}
                                    totalPages={announcementTotalPages}
                                    onPageChange={(page) => {
                                        setAnnouncementPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    totalItems={announcements.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                />
                            </>
                        ) : (
                            <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground text-sm dark:border-neutral-800">
                                <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                No society announcements recorded.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}