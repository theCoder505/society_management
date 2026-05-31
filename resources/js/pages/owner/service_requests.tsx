import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { SearchableTable } from '@/components/SearchableTable';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, MessageSquare, LoaderCircle } from 'lucide-react';
import FlashMessage from '../FlashMessage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Service Requests', href: '/owner/service-requests' },
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
  tenantRequests: ServiceRequest[];
  adminRequests: ServiceRequest[];
}

export default function OwnerServiceRequests({ tenantRequests, adminRequests }: ServiceRequestsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const createForm = useForm({
    title: '',
    requet_details: '',
  });

  const deleteForm = useForm({ id: '' });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/owner/service-requests/create', {
      onSuccess: () => {
        setShowCreateModal(false);
        createForm.reset();
      },
    });
  };

  const handleDelete = () => {
    if (!selectedRequest) return;
    deleteForm.setData('id', String(selectedRequest.id));
    // Direct router call – same pattern used elsewhere
    const { router } = require('@inertiajs/react');
    router.post('/owner/service-requests/delete-admin', {
      _method: 'DELETE',
      id: selectedRequest.id,
    }, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setSelectedRequest(null);
      },
    });
  };

  // Columns for tenant‑to‑owner requests (read‑only)
  const tenantColumns = [
    {
      header: 'Request UID',
      accessor: (row: ServiceRequest) => <span className="font-mono text-xs font-semibold">{row.service_uid}</span>,
      sortable: true,
      sortKey: 'service_uid' as keyof ServiceRequest,
    },
    {
      header: 'Title',
      accessor: (row: ServiceRequest) => <span className="font-semibold text-foreground">{row.title}</span>,
      sortable: true,
      sortKey: 'title' as keyof ServiceRequest,
    },
    {
      header: 'Details',
      accessor: (row: ServiceRequest) => <p className="text-xs text-muted-foreground max-w-sm truncate">{row.requet_details}</p>,
    },
    {
      header: 'Submitted',
      accessor: (row: ServiceRequest) => new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      sortable: true,
      sortKey: 'created_at' as keyof ServiceRequest,
    },
    {
      header: 'Status',
      accessor: (row: ServiceRequest) => {
        const colors = {
          approved: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-900',
          rejected: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900',
          pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
        };
        const icons = {
          approved: <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />,
          rejected: <AlertTriangle className="h-3.5 w-3.5 text-red-500 mr-1" />,
          pending: <Clock className="h-3.5 w-3.5 text-amber-500 mr-1" />,
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[row.approve_status]}`}>
            {icons[row.approve_status]}
            <span className="capitalize">{row.approve_status}</span>
          </span>
        );
      },
    },
  ];

  // Columns for admin‑bound requests (owner created)
  const adminColumns = [
    ...tenantColumns,
    {
      header: 'Actions',
      accessor: (row: ServiceRequest) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            disabled={row.approve_status !== 'pending'}
            onClick={() => {
              setSelectedRequest(row);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Owner Service Requests" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <FlashMessage />
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Service Requests</h1>
            <p className="text-muted-foreground text-sm">View tenant requests and submit admin‑level requests.</p>
          </div>
          <Button onClick={() => { createForm.reset(); setShowCreateModal(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            New Admin Request
          </Button>
        </div>
        {/* Tenant Requests */}
        <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
          <h3 className="font-bold text-lg text-foreground mb-4">Tenant Requests to You</h3>
          <SearchableTable
            data={tenantRequests}
            columns={tenantColumns}
            searchKeys={['title', 'requet_details', 'service_uid']}
            searchPlaceholder="Search tenant requests..."
            rowsPerPage={8}
          />
        </div>
        {/* Owner to Admin Requests */}
        <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
          <h3 className="font-bold text-lg text-foreground mb-4">Your Requests to Administration</h3>
          <SearchableTable
            data={adminRequests}
            columns={adminColumns}
            searchKeys={['title', 'requet_details', 'service_uid']}
            searchPlaceholder="Search admin requests..."
            rowsPerPage={8}
          />
        </div>
      </div>
      {/* Create Request Modal */}
      <Dialog open={showCreateModal} onOpenChange={(v) => { if (!v) setShowCreateModal(false); }}>
        <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5 text-primary" />
              Submit Admin Service Request
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Subject / Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                required
                value={createForm.data.title}
                onChange={e => createForm.setData('title', e.target.value)}
                placeholder="e.g. Request new fire‑alarm installation"
              />
              {createForm.errors.title && <p className="text-xs text-destructive">{createForm.errors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requet_details">Details <span className="text-destructive">*</span></Label>
              <Textarea
                id="requet_details"
                required
                rows={5}
                value={createForm.data.requet_details}
                onChange={e => createForm.setData('requet_details', e.target.value)}
                placeholder="Provide a clear description and any relevant deadlines."
                className="resize-none"
              />
              {createForm.errors.requet_details && <p className="text-xs text-destructive">{createForm.errors.requet_details}</p>}
            </div>
            <DialogFooter className="mt-4 gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createForm.processing}>
                {createForm.processing && <LoaderCircle className="h-4 w-4 mr-1.5 animate-spin" />}
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-400">Delete Service Request</AlertDialogTitle>
            <AlertDialogDescription className="text-red-600/80 dark:text-red-400/80">
              Are you sure you want to delete the request <strong>{selectedRequest?.service_uid}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRequest(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600" onClick={handleDelete}>
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
