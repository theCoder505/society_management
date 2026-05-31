import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/admin/settings/profile',
    },
];

function ProfileForm({ mustVerifyEmail, status, auth }: { mustVerifyEmail: boolean; status?: string; auth: any }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        old_email: '',
        otp: '',
    });

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpSending, setOtpSending] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // If email changed and no OTP provided yet
        if (data.email !== auth.user.email && !data.otp) {
            sendOtp();
            return;
        }

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowOtpModal(false);
                setData('otp', '');
            },
        });
    };

    const sendOtp = () => {
        setOtpSending(true);
        router.post(
            route('profile.send-otp'),
            { type: 'email' },
            {
                onSuccess: () => setShowOtpModal(true),
                onFinish: () => setOtpSending(false),
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <div className="w-full space-y-6">
            <HeadingSmall title="Profile information" description="Update your name and email address" />
            <form onSubmit={submit} className="w-full space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Full name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="Email address"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>
                {mustVerifyEmail && auth.user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-neutral-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <Button disabled={processing || otpSending}>{otpSending ? 'Sending OTP...' : 'Save Profile'}</Button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-neutral-600">Saved</p>
                    </Transition>
                </div>
            </form>

            <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify Email Change</DialogTitle>
                        <DialogDescription>
                            We've sent a 6-digit verification code to <strong>{auth.user.email}</strong>. Please enter it below to confirm your email
                            change.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="old_email_confirm">Current Email Address</Label>
                            <Input
                                id="old_email_confirm"
                                type="email"
                                value={data.old_email}
                                onChange={(e) => setData('old_email', e.target.value)}
                                placeholder="Enter your current email"
                            />
                            <InputError message={errors.old_email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className="text-center text-2xl tracking-[0.5em]"
                            />
                            <InputError message={errors.otp} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowOtpModal(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={submit} disabled={processing}>
                            Verify & Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function PasswordForm() {
    const { auth } = usePage<SharedData>().props;
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
        otp: '',
    });

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpSending, setOtpSending] = useState(false);

    const sendOtp = () => {
        // Validate password fields before sending OTP
        if (!data.current_password || !data.password || !data.password_confirmation) {
            put(route('password.update')); // This will trigger server-side validation for these fields
            return;
        }

        setOtpSending(true);
        router.post(
            route('profile.send-otp'),
            { type: 'password' },
            {
                onSuccess: () => setShowOtpModal(true),
                onFinish: () => setOtpSending(false),
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.otp) {
            sendOtp();
            return;
        }

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowOtpModal(false);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />
            <form onSubmit={updatePassword} className="max-w-xl space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="current_password">Current password</Label>
                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        placeholder="Current password"
                    />
                    <InputError message={errors.current_password} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        placeholder="New password"
                    />
                    <InputError message={errors.password} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm password</Label>
                    <Input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>
                <div className="flex items-center gap-4">
                    <Button disabled={processing || otpSending}>{otpSending ? 'Sending OTP...' : 'Save password'}</Button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-neutral-600">Saved</p>
                    </Transition>
                </div>
            </form>

            <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify Password Change</DialogTitle>
                        <DialogDescription>
                            We've sent a 6-digit verification code to <strong>{auth.user.email}</strong>. Please enter it below to confirm your
                            password change.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password_otp">Verification Code</Label>
                            <Input
                                id="password_otp"
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className="text-center text-2xl tracking-[0.5em]"
                            />
                            <InputError message={errors.otp} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowOtpModal(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={updatePassword} disabled={processing}>
                            Verify & Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            <div className="grid-cols-1 gap-6 space-y-10 p-6 lg:grid lg:grid-cols-2 lg:p-8">
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} auth={auth} />
                <PasswordForm />
                <div className="col-span-2 flex items-center justify-center space-y-6">
                    <div className="grid gap-2">
                        <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                        <AppearanceTabs />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
