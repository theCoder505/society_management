<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Appartment;
use App\Models\Flat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TenantsController extends Controller
{







    public function tenants1()
    {
        $tenant = Tenant::where('id', 1)->get();
        return response()->json([
            'tenant' => $tenant
        ]);
    }




    public function all_tenants()
    {
        $tenants = Tenant::all();
        $apartments = Appartment::all(['appartment_uid', 'appartment_name']);
        $flats = Flat::all(['flatID', 'appartment_uid', 'tenant_uid', 'rent_price']);
        return Inertia::render('admin/tenants', compact('tenants', 'apartments', 'flats'));
    }











    public function create_tenant(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_front'      => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_back'       => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'hometown'       => 'required|string|max:255',
            'permanent_addr' => 'required|string',
            'contact'        => 'required|string|max:20',
            'email'          => 'required|email|unique:tenants,email',
            'renting_flats'  => 'nullable|string',
            'current_rent_amount' => 'nullable|string',
            'family_members' => 'nullable|integer|min:0',
            'renting_since'  => 'nullable|date',
            'notes'          => 'nullable|string',
            'appartments'    => 'nullable|string', // UI-only field, not stored directly
        ]);

        // Handle images
        foreach (['image' => 'tenants/profiles', 'nid_front' => 'tenants/nid', 'nid_back' => 'tenants/nid'] as $field => $dir) {
            if ($request->hasFile($field)) {
                $filename = Str::random(40) . '.' . $request->file($field)->getClientOriginalExtension();
                $path = $request->file($field)->storeAs($dir, $filename, 'public');
                $validated[$field] = '/storage/' . $path;
            }
        }

        $validated['password']   = null;
        $validated['otp']        = null;
        $validated['tenant_uid'] = 'TNT_' . rand(1111, 9999);

        // Derive starting_rent_amount from the selected flats' rent_price
        $flatIDs = array_filter(array_map('trim', explode(',', $validated['renting_flats'] ?? '')));
        if (!empty($flatIDs)) {
            $rentPrices = Flat::whereIn('flatID', $flatIDs)->pluck('rent_price', 'flatID');
            $startingRents = [];
            foreach ($flatIDs as $fid) {
                $startingRents[$fid] = $rentPrices[$fid] ?? null;
            }
            $validated['starting_rent_amount'] = json_encode($startingRents);

            $currentRents = [];
            if (!empty($validated['current_rent_amount'])) {
                foreach (explode(',', $validated['current_rent_amount']) as $pair) {
                    [$fid, $amt] = array_pad(explode(':', $pair, 2), 2, null);
                    if ($fid && $amt !== null) $currentRents[trim($fid)] = (float) trim($amt);
                }
            }
            $validated['current_rent_amount'] = !empty($currentRents) ? json_encode($currentRents) : json_encode($startingRents);
            Flat::whereIn('flatID', $flatIDs)->update(['tenant_uid' => $validated['tenant_uid']]);
        }

        // Store renting_flats as JSON array
        $validated['renting_flats'] = !empty($flatIDs) ? json_encode(array_values($flatIDs)) : null;

        // Remove UI-only field
        unset($validated['appartments']);

        Tenant::create($validated);
        return back()->with('success', 'Tenant created successfully!');
    }









    public function spec_tenant($tenant_uid)
    {
        $tenant = Tenant::where('tenant_uid', $tenant_uid)->firstOrFail();
        return Inertia::render('admin/tenant-detail', compact('tenant'));
    }





    public function update_tenant(Request $request)
    {
        $validated = $request->validate([
            'tenant_uid'     => 'required|string|exists:tenants,tenant_uid',
            'name'           => 'required|string|max:255',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_front'      => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_back'       => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'hometown'       => 'required|string|max:255',
            'permanent_addr' => 'required|string',
            'contact'        => 'required|string|max:20',
            'email'          => 'required|email|unique:tenants,email,' . Tenant::where('tenant_uid', $request->tenant_uid)->value('id'),
            'renting_flats'  => 'nullable|string',
            'current_rent_amount' => 'nullable|string',
            'family_members' => 'nullable|integer|min:0',
            'renting_since'  => 'nullable|date',
            'notes'          => 'nullable|string',
            'appartments'    => 'nullable|string',
        ]);

        $tenant = Tenant::where('tenant_uid', $validated['tenant_uid'])->first();

        // ── Images ──────────────────────────────────────────────────────────
        foreach (
            ['image' => 'tenants/profiles', 'nid_front' => 'tenants/nid', 'nid_back' => 'tenants/nid']
            as $field => $dir
        ) {
            if ($request->hasFile($field)) {
                if ($tenant->$field) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $tenant->$field));
                }
                $filename = Str::random(40) . '.' . $request->file($field)->getClientOriginalExtension();
                $path = $request->file($field)->storeAs($dir, $filename, 'public');
                $validated[$field] = '/storage/' . $path;
            } else {
                unset($validated[$field]); // keep existing
            }
        }

        // ── Flat tenant sync ─────────────────────────────────────────────────
        $previousFlats = [];
        if ($tenant->renting_flats) {
            $decoded = json_decode($tenant->renting_flats, true);
            $previousFlats = is_array($decoded)
                ? $decoded
                : array_filter(array_map('trim', explode(',', $tenant->renting_flats)));
        }

        $newFlatIDs = array_filter(array_map('trim', explode(',', $validated['renting_flats'] ?? '')));

        $removedFlats = array_diff($previousFlats, $newFlatIDs);
        if (!empty($removedFlats)) {
            Flat::whereIn('flatID', $removedFlats)
                ->where('tenant_uid', $tenant->tenant_uid)
                ->update(['tenant_uid' => null]);
        }

        $addedFlats = array_diff($newFlatIDs, $previousFlats);
        if (!empty($addedFlats)) {
            Flat::whereIn('flatID', $addedFlats)->update(['tenant_uid' => $tenant->tenant_uid]);
        }

        // Rebuild starting_rent_amount only for newly added flats (keep existing for old ones)
        if (!empty($newFlatIDs)) {
            $existingStarting = [];
            if ($tenant->starting_rent_amount) {
                $existingStarting = json_decode($tenant->starting_rent_amount, true) ?? [];
            }
            $newRentPrices = Flat::whereIn('flatID', $addedFlats)->pluck('rent_price', 'flatID');
            foreach ($addedFlats as $fid) {
                $existingStarting[$fid] = $newRentPrices[$fid] ?? null;
            }
            // Remove entries for removed flats
            foreach ($removedFlats as $fid) {
                unset($existingStarting[$fid]);
            }
            $validated['starting_rent_amount'] = json_encode($existingStarting);
            $validated['renting_flats'] = json_encode(array_values($newFlatIDs));
        } else {
            $validated['starting_rent_amount'] = null;
            $validated['renting_flats'] = null;
        }


        if (!empty($validated['current_rent_amount'])) {
            $currentRents = [];
            foreach (explode(',', $validated['current_rent_amount']) as $pair) {
                [$fid, $amt] = array_pad(explode(':', $pair, 2), 2, null);
                if ($fid && $amt !== null) $currentRents[trim($fid)] = (float) trim($amt);
            }
            $validated['current_rent_amount'] = json_encode($currentRents);
        }

        unset($validated['appartments']);
        $tenant->update($validated);
        return back()->with('success', 'Tenant updated successfully!');
    }





    public function delete_tenant(Request $request)
    {
        $request->validate([
            'tenant_uid' => 'required|string|exists:tenants,tenant_uid',
        ]);

        $tenant = Tenant::where('tenant_uid', $request->tenant_uid)->first();

        // Clear tenant_uid from all flats belonging to this tenant
        Flat::where('tenant_uid', $tenant->tenant_uid)->update(['tenant_uid' => null]);

        // Delete files
        foreach (['image', 'nid_front', 'nid_back'] as $field) {
            if ($tenant && $tenant->$field) {
                $path = str_replace('/storage/', '', $tenant->$field);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $tenant->delete();
        return back()->with('success', 'Tenant deleted successfully!');
    }












    public function tenant_notices()
    {
        $data = [];
        return Inertia::render('admin/tenant_notices', compact('data'));
    }
}
