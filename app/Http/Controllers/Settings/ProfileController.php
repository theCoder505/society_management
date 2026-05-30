<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\AppSetting;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }





        public function sendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => 'required|in:email,password',
        ]);

        $user = $request->user();
        $otp = rand(100000, 999999);
        
        // Save OTP to user record
        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        $brandname = AppSetting::where('id', 1)->value('brand_name') ?? config('app.name');
        $template = $request->type === 'email' ? 'mail.admin.email_change_otp' : 'mail.admin.pwd_change_otp';
        $subject = $request->type === 'email' ? "Email Change OTP - {$brandname}" : "Password Change OTP - {$brandname}";

        Mail::send(
            $template,
            ['otp' => $otp, 'user' => $user, 'brandname' => $brandname],
            function ($message) use ($user, $subject) {
                $message->to($user->email)
                    ->subject($subject);
            }
        );

        return back()->with('status', 'otp-sent');
    }
}
