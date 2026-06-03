<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('admin/login', [
            'canResetPassword' => Route::has('password.request'),
            'status'           => $request->session()->get('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $role = $request->input('role');

        // Store role in session so middleware/share can read it
        $request->session()->put('auth_role', $role);

        $redirectUrl = match ($role) {
            'owner'  => '/owner/dashboard',
            'tenant' => '/tenant/dashboard',
            default  => '/admin/dashboard',
        };

        return redirect()->intended($redirectUrl);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $role = $request->session()->get('auth_role', 'web');

        $guard = match ($role) {
            'owner'  => 'owner',
            'tenant' => 'tenant',
            default  => 'web',
        };

        Auth::guard($guard)->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}