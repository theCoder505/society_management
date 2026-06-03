<?php

namespace App\Http\Controllers;

use App\Models\Appartment;
use App\Models\Flat;
use App\Models\AppSetting;
use App\Mail\InquiryMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SurfaceWebController extends Controller
{
    /**
     * Display the surface web landing page with apartments & flats details.
     */
    public function home()
    {
        $apartments = Appartment::all();
        $flats = Flat::all();
        $settings = AppSetting::where('id', 1)->first();

        $availableForRent = Flat::where('flat_type', 'to_rent')->get();
        $availableForSale = Flat::whereNull('owner_uid')->get();

        return Inertia::render('surface/home', [
            'apartments' => $apartments,
            'flats' => $flats,
            'settings' => $settings,
            'availableForRent' => $availableForRent,
            'availableForSale' => $availableForSale,
        ]);
    }

    public function apartments()
    {
        $apartments = Appartment::all();
        $settings = AppSetting::where('id', 1)->first();
        return Inertia::render('surface/apartments', [
            'apartments' => $apartments,
            'settings' => $settings,
        ]);
    }

    public function flats()
    {
        $flats = Flat::all();
        $apartments = Appartment::all();
        $settings = AppSetting::where('id', 1)->first();
        return Inertia::render('surface/flats', [
            'flats' => $flats,
            'apartments' => $apartments,
            'settings' => $settings,
        ]);
    }

    public function about()
    {
        $settings = AppSetting::where('id', 1)->first();
        return Inertia::render('surface/about', [
            'settings' => $settings,
        ]);
    }

    public function privacyPolicy()
    {
        $settings = AppSetting::where('id', 1)->first();
        return Inertia::render('surface/privacy-policy', [
            'settings' => $settings,
        ]);
    }

    public function termsConditions()
    {
        $settings = AppSetting::where('id', 1)->first();
        return Inertia::render('surface/terms-conditions', [
            'settings' => $settings,
        ]);
    }

    /**
     * Display the contact page.
     */
    public function contact()
    {
        $settings = AppSetting::where('id', 1)->first();
        $flats = Flat::where(function($q) {
            $q->where('flat_type', 'to_rent')->orWhereNull('owner_uid');
        })->get(['flatID', 'flat_type', 'rent_price', 'flat_price']);

        return Inertia::render('surface/contact', [
            'settings' => $settings,
            'flats' => $flats,
        ]);
    }

    /**
     * Submit contact form / joining inquiry.
     */
    public function submitInquiry(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'contact' => ['required', 'string', 'max:20'],
            'type' => ['required', 'in:purchase,rent,other'],
            'flat_id' => ['nullable', 'string', 'exists:flats,flatID'],
            'message' => ['required', 'string'],
        ]);

        $settings = AppSetting::where('id', 1)->first();
        $adminEmail = $settings->contact_email ?? 'lead@societyventure.com';

        Log::info("Surface Inquiry submitted by {$validated['email']}: ", $validated);

        try {
            Mail::to($adminEmail)->send(new InquiryMail($validated));
        } catch (\Exception $e) {
            Log::error("Failed to send inquiry email: " . $e->getMessage());
        }

        return back()->with('success', 'Your inquiry has been submitted. The society lead will get in touch with you shortly.');
    }
}
