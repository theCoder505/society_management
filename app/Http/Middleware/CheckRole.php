<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        // Map role name to guard name
        $guard = match ($role) {
            'owner'  => 'owner',
            'tenant' => 'tenant',
            'admin'  => 'web',
            default  => 'web',
        };

        if (!Auth::guard($guard)->check()) {
            return match ($role) {
                'tenant' => redirect()->route('portal.login', ['role' => 'tenant'])
                                ->with('error', 'Please log in as a tenant.'),
                'owner'  => redirect()->route('portal.login', ['role' => 'owner'])
                                ->with('error', 'Please log in as a flat owner.'),
                default  => redirect()->route('portal.login', ['role' => 'admin'])
                                ->with('error', 'Please log in as admin.'),
            };
        }

        Auth::shouldUse($guard); // <-- use guard name, not role name

        return $next($request);
    }
}