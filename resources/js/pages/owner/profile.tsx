// resources/js/pages/owner/profile.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Info, Key, LoaderCircle, Mail, ShieldCheck, Upload, User } from 'lucide-react';
import React, { useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Profile Settings',
        href: '/owner/profile',
    },
];

interface Owner {
    owner_uid: string;
    name: string;
    hometown: string;
    permanent_addr: string;
    contact_number: string;
    email: string;
    image: string | null;
    nid_front_page: string | null;
    nid_back_page: string | null;
    profile_status: 'verified' | 'owner-modified';
    appartments: string | null;
    flats: string | null;
}

interface ProfileProps {
    owner: Owner;
}

export default function OwnerProfile({ owner }: ProfileProps) {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
    const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);

    const profileForm = useForm({
        name: owner.name ?? '',
        hometown: owner.hometown ?? '',
        permanent_addr: owner.permanent_addr ?? '',
        contact_number: owner.contact_number ?? '',
        image: null as File | null,
        nid_front_page: null as File | null,
        nid_back_page: null as File | null,
    });

    const emailForm = useForm({
        new_email: '',
        otp: '',
    });

    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
        otp: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/owner/profile/update', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleSendOtp = () => {
        setSendingOtp(true);
        profileForm.post('/owner/profile/send-otp', {
            preserveScroll: true,
            onSuccess: () => {
                setOtpSent(true);
                setSendingOtp(false);
            },
            onError: () => {
                setSendingOtp(false);
            },
        });
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        emailForm.post('/owner/profile/update-email', {
            onSuccess: () => {
                setShowEmailModal(false);
                setOtpSent(false);
                emailForm.reset();
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/owner/profile/update-password', {
            onSuccess: () => {
                setShowPasswordModal(false);
                setOtpSent(false);
                passwordForm.reset();
            },
        });
    };

    const handleFileChange = (field: 'image' | 'nid_front_page' | 'nid_back_page', file: File | null, setPreview: (url: string | null) => void) => {
        profileForm.setData(field, file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold tracking-tight">My Profile Settings</h1>
                        <p className="text-muted-foreground text-sm">Manage your profile credentials and identification cards</p>
                    </div>
                    <div>
                        {owner.profile_status === 'verified' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-950/20 dark:text-green-400">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Profile Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-950/20 dark:text-amber-400">
                                <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                                Modified - Awaiting Audit
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left: Security + Ownership Info */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                            <h3 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
                                <ShieldCheck className="text-primary h-5 w-5" />
                                Account Security
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-muted/40 rounded-lg border p-3 text-xs">
                                    <p className="text-muted-foreground font-semibold">Registered Email</p>
                                    <p className="text-foreground mt-0.5 font-medium">{owner.email}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={() => {
                                            setOtpSent(false);
                                            emailForm.reset();
                                            setShowEmailModal(true);
                                        }}
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        Update Email Address
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={() => {
                                            setOtpSent(false);
                                            passwordForm.reset();
                                            setShowPasswordModal(true);
                                        }}
                                    >
                                        <Key className="mr-2 h-4 w-4" />
                                        Update Password
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Ownership Details Card */}
                        <div className="bg-card rounded-xl border p-6 shadow-xs dark:border-neutral-800">
                            <h3 className="text-foreground mb-3 flex items-center gap-2 font-semibold">
                                <User className="text-primary h-5 w-5" />
                                Ownership Details
                            </h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between border-b py-1 dark:border-neutral-800">
                                    <span className="text-muted-foreground">Owner ID</span>
                                    <span className="text-foreground font-mono font-semibold">{owner.owner_uid}</span>
                                </div>
                                <div className="flex justify-between border-b py-1 dark:border-neutral-800">
                                    <span className="text-muted-foreground">Appartments</span>
                                    <span className="text-primary font-semibold">
                                        {owner.appartments
                                            ?.split(',')
                                            .map((s) => s.trim())
                                            .join(', ') || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">Flats</span>
                                    <span className="text-primary font-semibold">
                                        {owner.flats
                                            ?.split(',')
                                            .map((s) => s.trim())
                                            .join(', ') || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Profile Form */}
                    <div className="bg-card rounded-xl border p-6 shadow-xs md:col-span-2 dark:border-neutral-800">
                        <h3 className="text-foreground mb-4 text-lg font-bold">Basic Information</h3>

                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {profileForm.errors.name && <p className="text-destructive text-xs">{profileForm.errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        value={profileForm.data.contact_number}
                                        onChange={(e) => profileForm.setData('contact_number', e.target.value)}
                                        required
                                    />
                                    {profileForm.errors.contact_number && (
                                        <p className="text-destructive text-xs">{profileForm.errors.contact_number}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="hometown">Hometown</Label>
                                    <Input
                                        id="hometown"
                                        value={profileForm.data.hometown}
                                        onChange={(e) => profileForm.setData('hometown', e.target.value)}
                                        required
                                    />
                                    {profileForm.errors.hometown && <p className="text-destructive text-xs">{profileForm.errors.hometown}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="permanent_addr">Permanent Address</Label>
                                    <Textarea
                                        id="permanent_addr"
                                        value={profileForm.data.permanent_addr}
                                        onChange={(e) => profileForm.setData('permanent_addr', e.target.value)}
                                        required
                                        rows={2}
                                        className="resize-none"
                                    />
                                    {profileForm.errors.permanent_addr && (
                                        <p className="text-destructive text-xs">{profileForm.errors.permanent_addr}</p>
                                    )}
                                </div>
                            </div>

                            {/* Verification Warning */}
                            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
                                <p className="flex items-center gap-1 font-semibold">
                                    <Info className="h-3.5 w-3.5" />
                                    Identity Cards Update Notice
                                </p>
                                <p className="mt-1">
                                    Updating profile picture, NID front page, or NID back page will temporarily invalidate your verified status. The
                                    committee will review the changes.
                                </p>
                            </div>

                            {/* Files Grid */}
                            <div className="grid gap-6 sm:grid-cols-3">
                                <div className="bg-muted/20 flex flex-col items-center gap-2 rounded-lg border p-4 dark:border-neutral-800">
                                    <span className="text-xs font-semibold">Profile Photo</span>
                                    {(imagePreview || owner.image) && (
                                        <img
                                            src={imagePreview ?? owner.image!}
                                            className="h-20 w-20 rounded-full border object-cover"
                                            alt="Profile"
                                        />
                                    )}
                                    <label className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-2 inline-flex cursor-pointer items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium">
                                        <Upload className="mr-1 h-3 w-3" />
                                        Upload
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('image', e.target.files?.[0] ?? null, setImagePreview)}
                                        />
                                    </label>
                                    {profileForm.data.image && (
                                        <span className="text-primary max-w-[120px] truncate text-[10px] font-semibold">
                                            {(profileForm.data.image as File).name}
                                        </span>
                                    )}
                                </div>

                                <div className="bg-muted/20 flex flex-col items-center gap-2 rounded-lg border p-4 dark:border-neutral-800">
                                    <span className="text-xs font-semibold">NID Front Page</span>
                                    {(nidFrontPreview || owner.nid_front_page) && (
                                        <img
                                            src={nidFrontPreview ?? owner.nid_front_page!}
                                            className="h-12 w-20 rounded border object-cover"
                                            alt="NID Front"
                                        />
                                    )}
                                    <label className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-2 inline-flex cursor-pointer items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium">
                                        <Upload className="mr-1 h-3 w-3" />
                                        Upload
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('nid_front_page', e.target.files?.[0] ?? null, setNidFrontPreview)}
                                        />
                                    </label>
                                    {profileForm.data.nid_front_page && (
                                        <span className="text-primary max-w-[120px] truncate text-[10px] font-semibold">
                                            {(profileForm.data.nid_front_page as File).name}
                                        </span>
                                    )}
                                </div>

                                <div className="bg-muted/20 flex flex-col items-center gap-2 rounded-lg border p-4 dark:border-neutral-800">
                                    <span className="text-xs font-semibold">NID Back Page</span>
                                    {(nidBackPreview || owner.nid_back_page) && (
                                        <img
                                            src={nidBackPreview ?? owner.nid_back_page!}
                                            className="h-12 w-20 rounded border object-cover"
                                            alt="NID Back"
                                        />
                                    )}
                                    <label className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-2 inline-flex cursor-pointer items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium">
                                        <Upload className="mr-1 h-3 w-3" />
                                        Upload
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('nid_back_page', e.target.files?.[0] ?? null, setNidBackPreview)}
                                        />
                                    </label>
                                    {profileForm.data.nid_back_page && (
                                        <span className="text-primary max-w-[120px] truncate text-[10px] font-semibold">
                                            {(profileForm.data.nid_back_page as File).name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-4 dark:border-neutral-800">
                                <Button type="submit" disabled={profileForm.processing}>
                                    {profileForm.processing && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                                    Save Profile Updates
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Email Verification Modal */}
            <Dialog
                open={showEmailModal}
                onOpenChange={(v) => {
                    if (!v) setShowEmailModal(false);
                }}
            >
                <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-foreground flex items-center gap-2">
                            <Mail className="text-primary h-5 w-5" />
                            Update Registered Email
                        </DialogTitle>
                    </DialogHeader>

                    {!otpSent ? (
                        <div className="space-y-4 py-3">
                            <p className="text-muted-foreground text-sm">
                                To change your email address, we need to send a 6-digit verification code (OTP) to your current email:{' '}
                                <strong>{owner.email}</strong>.
                            </p>
                            <Button className="w-full" onClick={handleSendOtp} disabled={sendingOtp}>
                                {sendingOtp && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                                Send Verification Code
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailSubmit} className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="new_email">New Email Address</Label>
                                <Input
                                    id="new_email"
                                    type="email"
                                    required
                                    value={emailForm.data.new_email}
                                    onChange={(e) => emailForm.setData('new_email', e.target.value)}
                                    placeholder="Enter your new email address"
                                />
                                {emailForm.errors.new_email && <p className="text-destructive text-xs">{emailForm.errors.new_email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email_otp">6-Digit Verification Code (OTP)</Label>
                                <Input
                                    id="email_otp"
                                    required
                                    maxLength={6}
                                    value={emailForm.data.otp}
                                    onChange={(e) => emailForm.setData('otp', e.target.value)}
                                    placeholder="Enter OTP code"
                                    className="text-center font-mono text-lg tracking-widest"
                                />
                                {emailForm.errors.otp && <p className="text-destructive text-xs">{emailForm.errors.otp}</p>}
                            </div>
                            <DialogFooter className="mt-4 gap-2">
                                <Button type="button" variant="outline" onClick={() => setOtpSent(false)}>
                                    Back
                                </Button>
                                <Button type="submit" disabled={emailForm.processing}>
                                    {emailForm.processing && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                                    Verify & Change Email
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Password Verification Modal */}
            <Dialog
                open={showPasswordModal}
                onOpenChange={(v) => {
                    if (!v) setShowPasswordModal(false);
                }}
            >
                <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-foreground flex items-center gap-2">
                            <Key className="text-primary h-5 w-5" />
                            Update Portal Password
                        </DialogTitle>
                    </DialogHeader>

                    {!otpSent ? (
                        <div className="space-y-4 py-3">
                            <p className="text-muted-foreground text-sm">
                                Changing your password requires a 6-digit OTP code to verify your identity. The code will be sent to:{' '}
                                <strong>{owner.email}</strong>.
                            </p>
                            <Button className="w-full" onClick={handleSendOtp} disabled={sendingOtp}>
                                {sendingOtp && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                                Send Verification Code
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="new_password">New Password</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    required
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                />
                                {passwordForm.errors.password && <p className="text-destructive text-xs">{passwordForm.errors.password}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Verify new password"
                                />
                                {passwordForm.errors.password_confirmation && (
                                    <p className="text-destructive text-xs">{passwordForm.errors.password_confirmation}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pwd_otp">6-Digit Verification Code (OTP)</Label>
                                <Input
                                    id="pwd_otp"
                                    required
                                    maxLength={6}
                                    value={passwordForm.data.otp}
                                    onChange={(e) => passwordForm.setData('otp', e.target.value)}
                                    placeholder="Enter OTP code"
                                    className="text-center font-mono text-lg tracking-widest"
                                />
                                {passwordForm.errors.otp && <p className="text-destructive text-xs">{passwordForm.errors.otp}</p>}
                            </div>
                            <DialogFooter className="mt-4 gap-2">
                                <Button type="button" variant="outline" onClick={() => setOtpSent(false)}>
                                    Back
                                </Button>
                                <Button type="submit" disabled={passwordForm.processing}>
                                    {passwordForm.processing && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                                    Verify & Update Password
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
