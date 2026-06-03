import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, User, KeyRound } from 'lucide-react';
import React, { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    role: 'tenant' | 'owner';
};

interface LoginProps {
    status?: string;
    defaultRole?: 'tenant' | 'owner';
}

export default function Login({ defaultRole = 'tenant' }: LoginProps) {
    const [role, setRole] = useState<'tenant' | 'owner'>(defaultRole as 'tenant' | 'owner');

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
        role: defaultRole,
    });

    // Update form data role when state changes
    useEffect(() => {
        setData('role', role);
    }, [role]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout 
            title="Access the Society Portal" 
            description="Select your role and enter your credentials to manage your flats and payments."
        >
            <Head title="Portal Login" />

            {/* Role Tabs */}
            <div className="bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-lg flex w-full mb-6 border dark:border-neutral-800">
                <button
                    type="button"
                    onClick={() => setRole('tenant')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                        role === 'tenant'
                            ? 'bg-white dark:bg-neutral-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <User className="h-3.5 w-3.5" />
                    Tenant
                </button>
                <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                        role === 'owner'
                            ? 'bg-white dark:bg-neutral-700 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <KeyRound className="h-3.5 w-3.5" />
                    Flat Owner
                </button>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={
                                role === 'tenant' 
                                    ? 'tenant@example.com' 
                                    : 'owner@example.com' 
                            }
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <TextLink href={`/set-password?role=${role}`} className="ml-auto text-sm" tabIndex={5}>
                                Activate / Reset Password?
                            </TextLink>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox 
                            id="remember" 
                            name="remember" 
                            tabIndex={3} 
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in as {role === 'tenant' ? 'Tenant' : 'Owner'}
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
