<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }



    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = null;
        $role = null;

        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
            $role = 'admin';
        } elseif (Auth::guard('owner')->check()) {
            $user = Auth::guard('owner')->user();
            $role = 'owner';
        } elseif (Auth::guard('tenant')->check()) {
            $user = Auth::guard('tenant')->user();
            $role = 'tenant';
        }

        return array_merge(parent::share($request), [
            'name'  => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth'  => [
                'user' => $user,
                'role' => $role,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
            ],
        ]);
    }
}
