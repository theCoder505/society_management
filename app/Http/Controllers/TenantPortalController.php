<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Flat;
use App\Models\TenantBill;
use App\Models\Notice;
use App\Models\Announcement;
use App\Models\ServiceRequest;
use App\Models\FlatOwner;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantPortalController extends Controller
{
    /**
     * Get the authenticated tenant.
     */
    private function getTenant(): Tenant
    {
        return Auth::guard('tenant')->user();
    }

    /**
     * Tenant Dashboard.
     */
    public function dashboard()
    {
        $tenant = $this->getTenant();

        // Get tenant's rented flats details
        $flatsList = is_array($tenant->renting_flats) ? $tenant->renting_flats : json_decode($tenant->renting_flats ?? '[]', true);
        $flats = Flat::whereIn('flatID', $flatsList)->get();

        // Payments stats
        $bills = TenantBill::where('tenant_uid', $tenant->tenant_uid)->get();
        $totalPaid = $bills->where('status', 'accepted')->sum('amount');
        $pendingBillsCount = $bills->where('status', 'pending')->count();

        // Latest announcements (from admin)
        $announcements = Announcement::orderBy('created_at', 'desc')->take(5)->get();

        // Notices for this tenant (from owner or admin)
        $notices = Notice::where('to_tenant_uid', $tenant->tenant_uid)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('tenant/dashboard', [
            'tenant' => $tenant,
            'flats' => $flats,
            'totalPaid' => $totalPaid,
            'pendingBillsCount' => $pendingBillsCount,
            'announcements' => $announcements,
            'notices' => $notices,
        ]);
    }

    /**
     * Tenant Payments page.
     */
    public function payments()
    {
        $tenant = $this->getTenant();
        $bills = TenantBill::where('tenant_uid', $tenant->tenant_uid)
            ->orderBy('created_at', 'desc')
            ->get();

        $flatsList = is_array($tenant->renting_flats) ? $tenant->renting_flats : json_decode($tenant->renting_flats ?? '[]', true);
        $flats = Flat::whereIn('flatID', $flatsList)->get();

        return Inertia::render('tenant/payments', [
            'bills' => $bills,
            'flats' => $flats,
            'currentMonth' => date('Y-m'),
        ]);
    }

    /**
     * Tenant "My Flats" — read-only view of rented flats with apartment name.
     */
    public function myFlats()
    {
        $tenant = $this->getTenant();
        $flatsList = is_array($tenant->renting_flats) ? $tenant->renting_flats : json_decode($tenant->renting_flats ?? '[]', true);
        $flats = Flat::whereIn('flatID', $flatsList)->get();

        // Attach apartment name to each flat
        $flats = $flats->map(function ($flat) {
            if ($flat->appartment_uid) {
                $apt = \App\Models\Appartment::where('appartment_uid', $flat->appartment_uid)->first();
                $flat->apartment_name = $apt ? $apt->appartment_name : null;
            } else {
                $flat->apartment_name = null;
            }
            return $flat;
        });

        return Inertia::render('tenant/my-flats', [
            'flats' => $flats,
        ]);
    }

    /**
     * Tenant "My Apartment" — read-only view of the apartment building(s) their flat belongs to.
     */
    public function myApartment()
    {
        $tenant = $this->getTenant();
        $flatsList = is_array($tenant->renting_flats) ? $tenant->renting_flats : json_decode($tenant->renting_flats ?? '[]', true);

        // Get unique apartment UIDs from the tenant's flats
        $appartmentUids = Flat::whereIn('flatID', $flatsList)
            ->whereNotNull('appartment_uid')
            ->pluck('appartment_uid')
            ->unique()
            ->values();

        $apartments = \App\Models\Appartment::whereIn('appartment_uid', $appartmentUids)->get();

        return Inertia::render('tenant/my-apartment', [
            'apartments' => $apartments,
        ]);
    }


    /**
     * Upload a new payment record (tenant bills).
     */
    public function uploadPayment(Request $request)
    {
        $tenant = $this->getTenant();

        $validated = $request->validate([
            'transaction_id' => ['required', 'string', 'unique:tenant_bills,transaction_id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'in:cash,bank_transfer,cheque,bkash,nagad,rocket,card,other'],
            'bill_type' => ['required', 'in:monthly,electricity,water,gas,wifi,dish,garage,utility,other'],
            'sent_money_to' => ['required', 'in:flat_owner,guard,society_lead,other'],
            'note' => ['nullable', 'string'],
        ]);

        // Enforce that payment can only be uploaded for the current month
        $validated['billing_month'] = date('Y-m');
        $validated['tenant_uid'] = $tenant->tenant_uid;
        $validated['status'] = 'pending';
        $validated['is_admin_modified'] = false;

        TenantBill::create($validated);

        return back()->with('success', 'Payment details uploaded successfully and pending approval.');
    }




    public function deletePayment(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:tenant_bills,id']
        ]);
        $bill = TenantBill::findOrFail($request->id);
        if ($bill->tenant_uid !== $this->getTenant()->tenant_uid) {
            abort(403, 'Unauthorized action.');
        }
        if ($bill->status !== 'pending') {
            abort(403, 'Only pending bills can be deleted.');
        }
        $bill->delete();
        return back()->with('success', 'Bill deleted successfully.');
    }



    /**
     * Tenant Notices & Announcements.
     */
    public function notices()
    {
        $tenant = $this->getTenant();

        $notices = Notice::where('to_tenant_uid', $tenant->tenant_uid)
            ->orderBy('created_at', 'desc')
            ->get();

        $announcements = Announcement::orderBy('created_at', 'desc')->get();

        return Inertia::render('tenant/notices', [
            'notices' => $notices,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Mark notice as complied.
     */
    public function complyNotice(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:notices,id']
        ]);

        $notice = Notice::findOrFail($request->id);

        if ($notice->to_tenant_uid !== $this->getTenant()->tenant_uid) {
            abort(403, 'Unauthorized action.');
        }

        $notice->update([
            'is_complied' => true,
            'complied_at' => now(),
        ]);

        return back()->with('success', 'Notice marked as complied.');
    }













    /**
     * Service requests.
     */
    public function serviceRequests()
    {
        $tenant = $this->getTenant();

        $requests = ServiceRequest::where('from_tenant_uid', $tenant->tenant_uid)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('tenant/service_requests', [
            'requests' => $requests,
        ]);
    }

    /**
     * Create service request.
     */
    public function createServiceRequest(Request $request)
    {
        $tenant = $this->getTenant();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'requet_details' => ['required', 'string'],
        ]);

        $validated['service_uid'] = 'SRV_' . rand(1000, 9999);
        $validated['from_tenant_uid'] = $tenant->tenant_uid;
        $validated['approve_status'] = 'pending';

        // Find the owner of the tenant's rented flat
        $flatsList = is_array($tenant->renting_flats) ? $tenant->renting_flats : json_decode($tenant->renting_flats ?? '[]', true);
        if (!empty($flatsList)) {
            $flat = Flat::whereIn('flatID', $flatsList)->whereNotNull('owner_uid')->first();
            if ($flat) {
                $validated['to_owner_uid'] = $flat->owner_uid;
                $validated['to_admin'] = false;
            } else {
                $validated['to_admin'] = true; // Fallback to Admin if flat has no registered owner
            }
        } else {
            $validated['to_admin'] = true;
        }

        ServiceRequest::create($validated);

        return back()->with('success', 'Service request submitted successfully.');
    }



    public function updateServiceRequest(Request $request)
    {
        $tenant = $this->getTenant();
        $validated = $request->validate([
            'id' => ['required', 'integer', 'exists:service_requests,id'],
            'title' => ['required', 'string', 'max:255'],
            'requet_details' => ['required', 'string'],
        ]);

        $srv = ServiceRequest::findOrFail($validated['id']);
        if ($srv->from_tenant_uid !== $tenant->tenant_uid) {
            abort(403, 'Unauthorized.');
        }
        if ($srv->approve_status !== 'pending') {
            abort(400, 'Only pending requests can be edited.');
        }
        $srv->update([
            'title' => $validated['title'],
            'requet_details' => $validated['requet_details'],
        ]);
        return back()->with('success', 'Service request updated successfully.');
    }



    public function deleteServiceRequest(Request $request)
    {
        $srv = ServiceRequest::findOrFail($request->id);
        if ($srv->from_tenant_uid !== $this->getTenant()->tenant_uid) {
            abort(403, 'Unauthorized.');
        }
        $srv->delete();
        return back()->with('success', 'Service request deleted successfully.');
    }

















    /**
     * Show profile page.
     */
    public function profile()
    {
        return Inertia::render('tenant/profile', [
            'tenant' => $this->getTenant(),
        ]);
    }

    /**
     * Update basic profile details.
     */
    public function updateProfile(Request $request)
    {
        $tenant = $this->getTenant();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'hometown' => ['required', 'string', 'max:255'],
            'permanent_addr' => ['required', 'string'],
            'contact' => ['required', 'string', 'max:20'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'nid_front' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'nid_back' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ]);

        // Remove image keys entirely so existing DB values are not overwritten
        unset($validated['image'], $validated['nid_front'], $validated['nid_back']);

        $hasSensitiveChanges = false;

        if ($request->hasFile('image')) {
            if ($tenant->image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $tenant->image));
            }
            $filename = Str::random(40) . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $request->file('image')->storeAs('tenants/profiles', $filename, 'public');
            $validated['image'] = '/storage/' . $path;
            $hasSensitiveChanges = true;
        }

        if ($request->hasFile('nid_front')) {
            if ($tenant->nid_front) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $tenant->nid_front));
            }
            $filename = Str::random(40) . '.' . $request->file('nid_front')->getClientOriginalExtension();
            $path = $request->file('nid_front')->storeAs('tenants/nid', $filename, 'public');
            $validated['nid_front'] = '/storage/' . $path;
            $hasSensitiveChanges = true;
        }

        if ($request->hasFile('nid_back')) {
            if ($tenant->nid_back) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $tenant->nid_back));
            }
            $filename = Str::random(40) . '.' . $request->file('nid_back')->getClientOriginalExtension();
            $path = $request->file('nid_back')->storeAs('tenants/nid', $filename, 'public');
            $validated['nid_back'] = '/storage/' . $path;
            $hasSensitiveChanges = true;
        }

        if ($hasSensitiveChanges) {
            $validated['profile_status'] = 'tenant-modified';
        }

        $tenant->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Send OTP to current email for updating sensitive fields.
     */
    public function sendProfileOtp(Request $request)
    {
        $tenant = $this->getTenant();

        $otp = strval(rand(100000, 999999));
        $tenant->otp = $otp;
        $tenant->save();

        Log::info("Tenant Profile Update OTP for {$tenant->email}: {$otp}");

        try {
            Mail::to($tenant->email)->send(new OtpMail($otp, "Account Security Update Code"));
        } catch (\Exception $e) {
            Log::error("Failed to send profile OTP email: " . $e->getMessage());
        }

        return back()->with('success', 'OTP code sent to your email.');
    }

    /**
     * Update email with OTP.
     */
    public function updateEmail(Request $request)
    {
        $request->validate([
            'new_email' => ['required', 'email', 'unique:tenants,email', 'unique:flat_owners,email', 'unique:admins,email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $tenant = $this->getTenant();

        if ($tenant->otp !== $request->otp) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        $tenant->update([
            'email' => $request->new_email,
            'otp' => null
        ]);

        return back()->with('success', 'Email updated successfully.');
    }

    /**
     * Update password with OTP.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $tenant = $this->getTenant();

        if ($tenant->otp !== $request->otp) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        $tenant->update([
            'password' => Hash::make($request->password),
            'otp' => null
        ]);

        return back()->with('success', 'Password updated successfully.');
    }
}
