import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { SearchableTable } from '@/components/SearchableTable';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, MessageSquare, LoaderCircle, Pencil } from 'lucide-react';
import FlashMessage from '../FlashMessage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service Requests',
        href: '/tenant/service-requests',
    },
];

interface ServiceRequest {
    id: number;
    service_uid: string;
    title: string;
    requet_details: string;
    approve_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface ServiceRequestsProps {
    requests: ServiceRequest[];
}

export default function TenantServiceRequests({ requests }: ServiceRequestsProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

    const createForm = useForm({
        title: '',
        requet_details: '',
    });

    const editForm = useForm({
        id: '',
        title: '',
        requet_details: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/tenant/service-requests/create', {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEditOpen = (row: ServiceRequest) => {
        setSelectedRequest(row);
        editForm.setData({
            id: String(row.id),
            title: row.title,
            requet_details: row.requet_details,
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.post('/tenant/service-requests/update', {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedRequest(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedRequest) return;
        router.delete('/tenant/service-requests/delete', {
            data: { id: selectedRequest.id },
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedRequest(null);
            },
        });
    };

    const statusColors = {
        approved: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-900',
        rejected: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900',
        pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
    };
    const statusIcons = {
        approved: <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />,
        rejected: <AlertTriangle className="h-3.5 w-3.5 text-red-500 mr-1" />,
        pending: <Clock className="h-3.5 w-3.5 text-amber-500 mr-1" />,
    };

    const columns = [
        {
            header: 'Request UID',
            accessor: (row: ServiceRequest) => <span className="font-mono text-xs font-semibold">{row.service_uid}</span>,
            sortable: true,
            sortKey: 'service_uid' as keyof ServiceRequest,
        },
        {
            header: 'Service Title',
            accessor: (row: ServiceRequest) => <span className="font-semibold text-foreground">{row.title}</span>,
            sortable: true,
            sortKey: 'title' as keyof ServiceRequest,
        },
        {
            header: 'Details',
            accessor: (row: ServiceRequest) => <p className="text-xs text-muted-foreground max-w-sm truncate">{row.requet_details}</p>,
        },
        {
            header: 'Date Submitted',
            accessor: (row: ServiceRequest) =>
                new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            sortable: true,
            sortKey: 'created_at' as keyof ServiceRequest,
        },
        {
            header: 'Status',
            accessor: (row: ServiceRequest) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[row.approve_status]}`}>
                    {statusIcons[row.approve_status]}
                    <span className="capitalize">{row.approve_status}</span>
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: (row: ServiceRequest) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={row.approve_status !== 'pending'}
                        onClick={() => handleEditOpen(row)}
                        title="Edit request"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={row.approve_status !== 'pending'}
                        onClick={() => {
                            setSelectedRequest(row);
                            setShowDeleteDialog(true);
                        }}
                        title="Delete request"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Requests" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Service & Maintenance Requests</h1>
                        <p className="text-muted-foreground text-sm">Submit and track maintenance issues directly to your landlord</p>
                    </div>
                    <Button onClick={() => { createForm.reset(); setShowCreateModal(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Service Request
                    </Button>
                </div>

                {/* Requests Table */}
                <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                    <h3 className="font-bold text-lg text-foreground mb-4">Request Log</h3>
                    <SearchableTable
                        data={requests}
                        columns={columns}
                        searchKeys={['title', 'requet_details', 'service_uid']}
                        searchPlaceholder="Search maintenance requests..."
                        rowsPerPage={10}
                    />
                </div>
            </div>

            {/* Create Service Request Modal */}
            <Dialog open={showCreateModal} onOpenChange={(v) => { if (!v) setShowCreateModal(false); }}>
                <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Submit Service Request
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="create-title">
                                Subject / Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="create-title"
                                required
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                placeholder="e.g. Water leak in washroom, elevator fan issue"
                            />
                            {createForm.errors.title && <p className="text-xs text-destructive">{createForm.errors.title}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-details">
                                Request Details / Descriptions <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="create-details"
                                required
                                rows={5}
                                value={createForm.data.requet_details}
                                onChange={(e: any) => createForm.setData('requet_details', e.target.value)}
                                placeholder="Describe the issue and preferred service times in detail..."
                                className="resize-none"
                            />
                            {createForm.errors.requet_details && <p className="text-xs text-destructive">{createForm.errors.requet_details}</p>}
                        </div>
                        <DialogFooter className="mt-4 gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Service Request Modal */}
            <Dialog open={showEditModal} onOpenChange={(v) => { if (!v) { setShowEditModal(false); setSelectedRequest(null); } }}>
                <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Pencil className="h-5 w-5 text-primary" />
                            Edit Service Request
                            {selectedRequest && (
                                <span className="ml-1 font-mono text-xs text-muted-foreground font-normal">
                                    ({selectedRequest.service_uid})
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">
                                Subject / Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit-title"
                                required
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                placeholder="e.g. Water leak in washroom, elevator fan issue"
                            />
                            {editForm.errors.title && <p className="text-xs text-destructive">{editForm.errors.title}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-details">
                                Request Details / Descriptions <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="edit-details"
                                required
                                rows={5}
                                value={editForm.data.requet_details}
                                onChange={(e: any) => editForm.setData('requet_details', e.target.value)}
                                placeholder="Describe the issue and preferred service times in detail..."
                                className="resize-none"
                            />
                            {editForm.errors.requet_details && <p className="text-xs text-destructive">{editForm.errors.requet_details}</p>}
                        </div>
                        <DialogFooter className="mt-4 gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700 dark:text-red-400">Cancel Service Request</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
                            Are you sure you want to delete and cancel service request{' '}
                            <strong>{selectedRequest?.service_uid ?? ''}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                            onClick={handleDelete}
                        >
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}