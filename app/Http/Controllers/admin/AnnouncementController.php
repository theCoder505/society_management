<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\FlatOwner;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{


    public function announcements()
    {
        $data    = Announcement::latest()->get();
        $owners  = FlatOwner::select('owner_uid', 'name')->get();
        $tenants = Tenant::select('tenant_uid', 'name')->get();
        return Inertia::render('admin/society_announcement', compact('data', 'owners', 'tenants'));
    }






    public function create_announcement(Request $request)
    {
        $validated = $request->validate([
            'title'                  => 'required|string|max:255',
            'details'                => 'required|string',
            'person_type'            => 'required|in:all,all_owners,all_tenants,owner,tenant',
            'announcement_for_uid'   => 'nullable|string|max:100',
        ]);
        if (in_array($validated['person_type'], ['all', 'all_owners', 'all_tenants'])) {
            $validated['announcement_for_uid'] = null;
        }
        Announcement::create($validated);
        return redirect()->back()->with('success', 'Announcement published successfully.');
    }







    public function update_announcement(Request $request)
    {
        $validated = $request->validate([
            'id'                     => 'required|integer|exists:announcements,id',
            'title'                  => 'required|string|max:255',
            'details'                => 'required|string',
            'person_type'            => 'required|in:all,all_owners,all_tenants,owner,tenant',
            'announcement_for_uid'   => 'nullable|string|max:100',
        ]);
        if (in_array($validated['person_type'], ['all', 'all_owners', 'all_tenants'])) {
            $validated['announcement_for_uid'] = null;
        }
        Announcement::findOrFail($validated['id'])->update($validated);
        return redirect()->back()->with('success', 'Announcement updated successfully.');
    }






    public function delete_announcement(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:announcements,id',
        ]);
        Announcement::findOrFail($request->id)->delete();
        return redirect()->back()->with('success', 'Announcement deleted successfully.');
    }
}
