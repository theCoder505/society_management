import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import React, { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import FlashMessage from '../FlashMessage';

interface SetPasswordForm {
    email: string;
    role: 'tenant' | 'owner';
    otp: string;
    password: string;
    password_confirmation: string;
}

interface SetPasswordProps {
    role?: 'tenant' | 'owner';
}

export default function SetPassword({ role: defaultRole = 'tenant' }: SetPasswordProps) {
    const [role, setRole] = useState<'tenant' | 'owner'>(defaultRole);
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<SetPasswordForm>({
        email: '',
        role: defaultRole,
        otp: '',
        password: '',
        password_confirmation: '',
    });

    const handleRoleChange = (newRole: 'tenant' | 'owner') => {
        setRole(newRole);
        setData('role', newRole);
        setOtpSent(false); // Reset OTP state if they switch roles
    };

    // Step 1: Send OTP code
    const handleSendOtp = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!data.email) {
            errors.email = 'Email address is required.';
            return;
        }

        setSendingOtp(true);
        post('/set-password/send-otp', {
            preserveScroll: true,
            onSuccess: () => {
                setOtpSent(true);
                setSendingOtp(false);
            },
            onError: () => {
                setSendingOtp(false);
            }
        });
    };

    // Step 2: Submit password set
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/set-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout 
            title="Setup Your Password" 
            description="Activate your account or reset your password using a secure 6-digit verification code sent to your email."
        >
            <Head title="Setup Password" />
            <FlashMessage />

            {/* Role Tabs */}
            <div className="bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-lg flex w-full mb-6 border dark:border-neutral-800">
                <button
                    type="button"
                    disabled={otpSent}
                    onClick={() => handleRoleChange('tenant')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                        role === 'tenant'
                            ? 'bg-white dark:bg-neutral-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    } ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Tenant
                </button>
                <button
                    type="button"
                    disabled={otpSent}
                    onClick={() => handleRoleChange('owner')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                        role === 'owner'
                            ? 'bg-white dark:bg-neutral-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    } ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Flat Owner
                </button>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    {/* Email Input */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Registered Email Address</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    disabled={otpSent}
                                    tabIndex={1}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your registered email"
                                    className="pl-10"
                                />
                            </div>
                            {!otpSent && (
                                <Button 
                                    type="button" 
                                    onClick={handleSendOtp} 
                                    disabled={sendingOtp || !data.email}
                                >
                                    {sendingOtp && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                    Send OTP
                                </Button>
                            )}
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* OTP code and Passwords */}
                    {otpSent && (
                        <div className="grid gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid gap-2">
                                <Label htmlFor="otp">6-Digit Verification Code (OTP)</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    tabIndex={2}
                                    value={data.otp}
                                    onChange={(e) => setData('otp', e.target.value)}
                                    placeholder="Enter 6-digit OTP code"
                                    className="text-center tracking-widest font-mono text-lg"
                                />
                                <InputError message={errors.otp} />
                                <p className="text-[11px] text-muted-foreground text-center">
                                    Didn't get the code? <button type="button" onClick={handleSendOtp} className="text-primary hover:underline font-semibold">Resend OTP</button>
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Verify new password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-1.5" />}
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Save & Activate Account
                            </Button>
                        </div>
                    )}
                </div>

                <div className="text-muted-foreground text-center text-sm mt-2">
                    <Link href={`/login?role=${role}`} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-foreground transition-colors">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Portal Login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
