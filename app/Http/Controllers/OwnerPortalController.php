<?php

namespace App\Http\Controllers;

use App\Models\FlatOwner;
use App\Models\Flat;
use App\Models\Tenant;
use App\Models\TenantBill;
use App\Models\Notice;
use App\Models\Announcement;
use App\Models\ServiceRequest;
use App\Mail\OtpMail;
use App\Models\Appartment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OwnerPortalController extends Controller
{
    /**
     * Get the authenticated flat owner.
     */
    private function getOwner(): FlatOwner
    {
        return Auth::guard('owner')->user();
    }

    /**
     * Get the list of tenants renting flats owned by this owner.
     */
    private function getOwnerTenantsList($ownerUid)
    {
        // Pluck tenant UIDs from flats owned by this owner
        $tenantUids = Flat::where('owner_uid', $ownerUid)
            ->whereNotNull('tenant_uid')
            ->pluck('tenant_uid')
            ->toArray();

        return Tenant::whereIn('tenant_uid', $tenantUids)->get();
    }

    /**
     * Owner Dashboard.
     */
    public function dashboard()
    {
        $owner = $this->getOwner();

        // Flats owned by this owner
        $flats = Flat::where('owner_uid', $owner->owner_uid)->get();
        $totalFlats = $flats->count();

        // Tenants list
        $tenants = $this->getOwnerTenantsList($owner->owner_uid);
        $totalTenants = $tenants->count();

        // Tenant UIDs list
        $tenantUids = $tenants->pluck('tenant_uid')->toArray();

        // Bills/Payments details
        $bills = TenantBill::whereIn('tenant_uid', $tenantUids)->get();
        $totalIncome = $bills->where('status', 'accepted')->sum('amount');
        $pendingApprovals = $bills->where('status', 'pending')->count();

        // Announcements
        $announcements = Announcement::orderBy('created_at', 'desc')->take(5)->get();

        // Tenant service requests to this owner
        $tenantRequests = ServiceRequest::where('to_owner_uid', $owner->owner_uid)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('owner/dashboard', [
            'owner' => $owner,
            'flats' => $flats,
            'totalFlats' => $totalFlats,
            'totalTenants' => $totalTenants,
            'totalIncome' => $totalIncome,
            'pendingApprovals' => $pendingApprovals,
            'announcements' => $announcements,
            'tenantRequests' => $tenantRequests,
        ]);
    }

    /**
     * Owner "My Flats" — read-only view of flats owned by the user.
     */
    public function myFlats()
    {
        $owner = $this->getOwner();

        // Get all flats owned by this owner
        $flats = Flat::where('owner_uid', $owner->owner_uid)->get();

        // Attach apartment and tenant names
        $flats = $flats->map(function ($flat) {
            // Get apartment name
            if ($flat->appartment_uid) {
                $apt = Appartment::where('appartment_uid', $flat->appartment_uid)->first();
                $flat->apartment_name = $apt ? $apt->appartment_name : null;
            } else {
                $flat->apartment_name = null;
            }

            // Get tenant name if rented
            if ($flat->tenant_uid) {
                $tenant = Tenant::where('tenant_uid', $flat->tenant_uid)->first();
                $flat->tenant_name = $tenant ? $tenant->name : null;
            } else {
                $flat->tenant_name = null;
            }

            return $flat;
        });

        return Inertia::render('owner/my-flats', [
            'flats' => $flats,
        ]);
    }




    public function updateFlatStatus(Request $request, Flat $flat)
    {
        $owner = $this->getOwner();
        if ($flat->owner_uid !== $owner->owner_uid) {
            abort(403, 'You do not own this flat.');
        }
        $validated = $request->validate([
            'flat_type' => ['required', 'in:rented,to_rent,to_live'],
        ]);
        $flat->update(['flat_type' => $validated['flat_type']]);
        return back();
    }








    /**
     * Owner "My Apartments" — read-only view of the apartment building(s) where their flats are located.
     */
    public function myApartments()
    {
        $owner = $this->getOwner();

        // Get unique apartment UIDs from the owner's flats
        $appartmentUids = Flat::where('owner_uid', $owner->owner_uid)
            ->whereNotNull('appartment_uid')
            ->pluck('appartment_uid')
            ->unique()
            ->values();

        $apartments = \App\Models\Appartment::whereIn('appartment_uid', $appartmentUids)->get();

        return Inertia::render('owner/my-apartments', [
            'apartments' => $apartments,
        ]);
    }

    /**
     * Manage Tenant Payments.
     */
    public function tenantPayments()
    {
        $owner = $this->getOwner();
        $tenants = $this->getOwnerTenantsList($owner->owner_uid);
        $tenantUids = $tenants->pluck('tenant_uid')->toArray();

        $bills = TenantBill::whereIn('tenant_uid', $tenantUids)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('owner/tenant_payments', [
            'bills' => $bills,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Approve or deny tenant payments.
     */
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:tenant_bills,id'],
            'status' => ['required', 'in:accepted,denied,pending'],
        ]);

        $bill = TenantBill::findOrFail($request->id);
        $owner = $this->getOwner();

        // Ensure this bill belongs to a tenant renting one of this owner's flats
        $tenants = $this->getOwnerTenantsList($owner->owner_uid);
        $tenantUids = $tenants->pluck('tenant_uid')->toArray();

        if (!in_array($bill->tenant_uid, $tenantUids)) {
            abort(403, 'Unauthorized action.');
        }

        $bill->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Payment status updated successfully.');
    }

    /**
     * Manage Notices for tenants.
     */
    public function notices()
    {
        $owner = $this->getOwner();

        $notices = Notice::where('from_owner_uid', $owner->owner_uid)
            ->orderBy('created_at', 'desc')
            ->get();

        $tenants = $this->getOwnerTenantsList($owner->owner_uid);
        $announcements = Announcement::orderBy('created_at', 'desc')->get();

        return Inertia::render('owner/notices', [
            'notices' => $notices,
            'tenants' => $tenants,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Create a notice for a tenant.
     */
    public function createNotice(Request $request)
    {
        $owner = $this->getOwner();

        $validated = $request->validate([
            'to_tenant_uid' => ['required', 'string', 'exists:tenants,tenant_uid'],
            'title' => ['required', 'string', 'max:255'],
            'notice_details' => ['required', 'string'],
        ]);

        // Ensure recipient is actually one of their tenants
        $tenants = $this->getOwnerTenantsList($owner->owner_uid);
        $tenantUids = $tenants->pluck('tenant_uid')->toArray();

        if (!in_array($validated['to_tenant_uid'], $tenantUids)) {
            return back()->withErrors(['to_tenant_uid' => 'The selected tenant is not renting any of your flats.']);
        }

        $validated['notice_uid'] = 'NTC_' . rand(1000, 9999);
        $validated['from_owner_uid'] = $owner->owner_uid;
        $validated['is_complied'] = false;

        Notice::create($validated);

        return back()->with('success', 'Notice sent to tenant successfully.');
    }

    /**
     * Edit notice.
     */
    public function updateNotice(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:notices,id'],
            'title' => ['required', 'string', 'max:255'],
            'notice_details' => ['required', 'string'],
        ]);

        $notice = Notice::findOrFail($request->id);

        if ($notice->from_owner_uid !== $this->getOwner()->owner_uid) {
            abort(403, 'Unauthorized action.');
        }

        $notice->update([
            'title' => $request->title,
            'notice_details' => $request->notice_details,
        ]);

        return back()->with('success', 'Notice updated successfully.');
    }

    /**
     * Delete notice.
     */
    public function deleteNotice(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:notices,id']
        ]);

        $notice = Notice::findOrFail($request->id);

        if ($notice->from_owner_uid !== $this->getOwner()->owner_uid) {
            abort(403, 'Unauthorized action.');
        }

        $notice->delete();

        return back()->with('success', 'Notice deleted successfully.');
    }

    /**
     * Service requests portal.
     */
    public function serviceRequests()
    {
        $owner = $this->getOwner();

        // Requests from tenants to this owner
        $tenantRequests = ServiceRequest::where('to_owner_uid', $owner->owner_uid)
            ->orderBy('created_at', 'desc')
            ->get();

        // Requests from this owner to the admin
        $adminRequests = ServiceRequest::where('from_owner_uid', $owner->owner_uid)
            ->where('to_admin', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('owner/service_requests', [
            'tenantRequests' => $tenantRequests,
            'adminRequests' => $adminRequests,
        ]);
    }

    /**
     * Create a service request to the admin.
     */
    public function createAdminServiceRequest(Request $request)
    {
        $owner = $this->getOwner();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'requet_details' => ['required', 'string'],
        ]);

        $validated['service_uid'] = 'SRV_' . rand(1000, 9999);
        $validated['from_owner_uid'] = $owner->owner_uid;
        $validated['to_admin'] = true;
        $validated['approve_status'] = 'pending';

        ServiceRequest::create($validated);

        return back()->with('success', 'Service request submitted to administration.');
    }

    /**
     * Update tenant service request status.
     */
    public function updateTenantServiceRequest(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:service_requests,id'],
            'approve_status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $srv = ServiceRequest::findOrFail($request->id);

        if ($srv->to_owner_uid !== $this->getOwner()->owner_uid) {
            abort(403, 'Unauthorized.');
        }

        $srv->update([
            'approve_status' => $request->approve_status,
        ]);

        return back()->with('success', 'Service request status updated.');
    }

    /**
     * Delete owner service request to admin.
     */
    public function deleteAdminServiceRequest(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:service_requests,id']
        ]);

        $srv = ServiceRequest::findOrFail($request->id);

        if ($srv->from_owner_uid !== $this->getOwner()->owner_uid || !$srv->to_admin) {
            abort(403, 'Unauthorized.');
        }

        $srv->delete();

        return back()->with('success', 'Service request deleted.');
    }

    /**
     * Update admin service request (owner created) details.
     */
    public function updateAdminServiceRequest(Request $request)
    {
        $request->validate([
            'id' => ['required', 'integer', 'exists:service_requests,id'],
            'title' => ['required', 'string', 'max:255'],
            'requet_details' => ['required', 'string'],
        ]);

        $srv = ServiceRequest::findOrFail($request->id);

        if ($srv->from_owner_uid !== $this->getOwner()->owner_uid || !$srv->to_admin) {
            abort(403, 'Unauthorized.');
        }

        $srv->update([
            'title' => $request->title,
            'requet_details' => $request->requet_details,
        ]);

        return back()->with('success', 'Admin service request updated successfully.');
    }

    /**
     * Owner profile.
     */
    public function profile()
    {
        return Inertia::render('owner/profile', [
            'owner' => $this->getOwner(),
        ]);
    }

    /**
     * Update basic profile details.
     */
    public function updateProfile(Request $request)
    {
        $owner = $this->getOwner();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'hometown' => ['required', 'string', 'max:255'],
            'permanent_addr' => ['required', 'string'],
            'contact_number' => ['required', 'string', 'max:20'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'nid_front_page' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'nid_back_page' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ]);

        // Remove image keys entirely so existing DB values are not overwritten
        unset($validated['image'], $validated['nid_front_page'], $validated['nid_back_page']);

        $hasSensitiveChanges = false;

        if ($request->hasFile('image')) {
            if ($owner->image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $owner->image));
            }
            $filename = Str::random(40) . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $request->file('image')->storeAs('owners/profiles', $filename, 'public');
            $validated['image'] = '/storage/' . $path;
            $hasSensitiveChanges = true;
        }

        if ($request->hasFile('nid_front_page')) {
            if ($owner->nid_front_page) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $owner->nid_front_page));
            }
            $filename = Str::random(40) . '.' . $request->file('nid_front_page')->getClientOriginalExtension();
            $path = $request->file('nid_front_page')->storeAs('owners/nid', $filename, 'public');
            $validated['nid_front_page'] = '/storage/' . $path;
            $hasSensitiveChanges = true;
        }

        if ($request->hasFile('nid_back_page')) {
            if ($owner->nid_back_page) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $owner->nid_back_page));
            }
            $filename = Str::random(40) . '.' . $request->file('nid_back_page')->getClientOriginalExtension();
            $path = $request->file('nid_back_page')->storeAs('owners/nid', $filename, 'public');
            $validated['nid_back_page'] = '/storage/' . $path;
            $hasSensitiveChanges = true;
        }

        if ($hasSensitiveChanges) {
            $validated['profile_status'] = 'owner-modified';
        }

        $owner->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Send OTP to current email for updating sensitive fields.
     */
    public function sendProfileOtp(Request $request)
    {
        $owner = $this->getOwner();

        $otp = strval(rand(100000, 999999));
        $owner->otp = $otp;
        $owner->save();

        Log::info("Owner Profile Update OTP for {$owner->email}: {$otp}");

        try {
            Mail::to($owner->email)->send(new OtpMail($otp, "Account Security Update Code"));
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

        $owner = $this->getOwner();

        if ($owner->otp !== $request->otp) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        $owner->update([
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

        $owner = $this->getOwner();

        if ($owner->otp !== $request->otp) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        $owner->update([
            'password' => Hash::make($request->password),
            'otp' => null
        ]);

        return back()->with('success', 'Password updated successfully.');
    }
}
