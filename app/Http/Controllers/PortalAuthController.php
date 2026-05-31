<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\FlatOwner;
use App\Models\Tenant;
use App\Mail\OtpMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PortalAuthController extends Controller
{
    public function showLogin(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'status'      => $request->session()->get('status'),
            'defaultRole' => $request->query('role', 'tenant'),
        ]);
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $role = $request->input('role');

        $redirectUrl = match ($role) {
            'owner'  => '/owner/dashboard',
            'tenant' => '/tenant/dashboard',
            default  => '/admin/dashboard',
        };

        return redirect()->intended($redirectUrl);
    }

    public function logout(Request $request): RedirectResponse
    {
        // Log out from all guards
        Auth::guard('web')->logout();
        Auth::guard('owner')->logout();
        Auth::guard('tenant')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    // ── Set / Reset Password (for tenant & owner) ───────────────────────────

    public function showSetPassword(Request $request): Response
    {
        return Inertia::render('auth/set-password', [
            'role'  => $request->query('role', 'tenant'),
            'email' => $request->query('email', ''),
        ]);
    }

    public function sendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'role'  => ['required', 'in:owner,tenant'],
        ]);

        $model = $request->role === 'owner' ? FlatOwner::class : Tenant::class;
        $emailField = 'email';

        $user = $model::where($emailField, $request->email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'No account found with this email.']);
        }

        $otp = strval(rand(100000, 999999));
        $user->otp = $otp;
        $user->save();

        Log::info("Set-Password OTP for {$request->email}: {$otp}");

        try {
            Mail::to($request->email)->send(new OtpMail($otp, 'Password Setup / Reset Code'));
        } catch (\Exception $e) {
            Log::error('OTP email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'OTP sent to your email address.');
    }

    public function setPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'otp'      => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role'     => ['required', 'in:owner,tenant'],
        ]);

        $model = $request->role === 'owner' ? FlatOwner::class : Tenant::class;
        $user  = $model::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'No account found with this email.']);
        }

        if ($user->otp !== $request->otp) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'otp'      => null,
        ]);

        return redirect('/login?role=' . $request->role)
            ->with('success', 'Password set successfully. You can now log in.');
    }
}