<?php

namespace App\Http\Controllers;

use App\Models\FlatOwner;
use App\Models\Appartment;
use App\Models\Flat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class FlatOwnersController extends Controller
{







    public function all_owners()
    {
        $owners = FlatOwner::all();
        $apartments = Appartment::all(['appartment_uid', 'appartment_name']);
        $flats = Flat::all(['flatID', 'appartment_uid', 'owner_uid']);
        return Inertia::render('admin/flat_owners', compact('owners', 'apartments', 'flats'));
    }









    public function create_flat_owner(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_front_page' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_back_page'  => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'hometown'       => 'required|string|max:255',
            'permanent_addr' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'email'          => 'required|email|unique:flat_owners,email',
            'appartments'    => 'nullable|string',
            'flats'          => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            $filename = Str::random(40) . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $request->file('image')->storeAs('owners/profiles', $filename, 'public');
            $validated['image'] = '/storage/' . $path;
        }

        if ($request->hasFile('nid_front_page')) {
            $filename = Str::random(40) . '.' . $request->file('nid_front_page')->getClientOriginalExtension();
            $path = $request->file('nid_front_page')->storeAs('owners/nid', $filename, 'public');
            $validated['nid_front_page'] = '/storage/' . $path;
        }

        if ($request->hasFile('nid_back_page')) {
            $filename = Str::random(40) . '.' . $request->file('nid_back_page')->getClientOriginalExtension();
            $path = $request->file('nid_back_page')->storeAs('owners/nid', $filename, 'public');
            $validated['nid_back_page'] = '/storage/' . $path;
        }

        $validated['password'] = null;
        $validated['otp'] = null;
        $validated['owner_uid'] = 'OWNER_' . rand(1111, 9999);

        if (!empty($validated['flats'])) {
            $flatIDs = array_filter(array_map('trim', explode(',', $validated['flats'])));
            Flat::whereIn('flatID', $flatIDs)->update([
                'owner_uid' => $validated['owner_uid'],
                'bought_at' => now(),
            ]);
        }

        FlatOwner::create($validated);
        return back()->with('success', 'Flat owner created successfully!');
    }












    public function spec_flat_owner($owner_uid)
    {
        $owner = FlatOwner::where('owner_uid', $owner_uid)->firstOrFail();
        return Inertia::render('admin/flat-owner-detail', compact('owner'));
    }













    public function update_flat_owner(Request $request)
    {
        $validated = $request->validate([
            'owner_uid'      => 'required|string|exists:flat_owners,owner_uid',
            'name'           => 'required|string|max:255',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_front_page' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'nid_back_page'  => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'hometown'       => 'required|string|max:255',
            'permanent_addr' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'email'          => 'required|email|unique:flat_owners,email,' . FlatOwner::where('owner_uid', $request->owner_uid)->value('id'),
            'appartments'    => 'nullable|string',
            'flats'          => 'nullable|string',
        ]);

        $owner = FlatOwner::where('owner_uid', $validated['owner_uid'])->first();

        if ($request->hasFile('image')) {
            if ($owner->image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $owner->image));
            }
            $filename = Str::random(40) . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $request->file('image')->storeAs('owners/profiles', $filename, 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            unset($validated['image']);
        }

        if ($request->hasFile('nid_front_page')) {
            if ($owner->nid_front_page) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $owner->nid_front_page));
            }
            $filename = Str::random(40) . '.' . $request->file('nid_front_page')->getClientOriginalExtension();
            $path = $request->file('nid_front_page')->storeAs('owners/nid', $filename, 'public');
            $validated['nid_front_page'] = '/storage/' . $path;
        } else {
            unset($validated['nid_front_page']);
        }

        if ($request->hasFile('nid_back_page')) {
            if ($owner->nid_back_page) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $owner->nid_back_page));
            }
            $filename = Str::random(40) . '.' . $request->file('nid_back_page')->getClientOriginalExtension();
            $path = $request->file('nid_back_page')->storeAs('owners/nid', $filename, 'public');
            $validated['nid_back_page'] = '/storage/' . $path;
        } else {
            unset($validated['nid_back_page']);
        }

        $previousFlats = array_filter(array_map('trim', explode(',', $owner->flats ?? '')));

        $newFlats = !empty($validated['flats'])
            ? array_filter(array_map('trim', explode(',', $validated['flats'])))
            : [];

        $removedFlats = array_diff($previousFlats, $newFlats);
        if (!empty($removedFlats)) {
            Flat::whereIn('flatID', $removedFlats)
                ->where('owner_uid', $owner->owner_uid)
                ->update(['owner_uid' => null]);
        }
        $addedFlats = array_diff($newFlats, $previousFlats);
        if (!empty($addedFlats)) {
            Flat::whereIn('flatID', $addedFlats)->update([
                'owner_uid' => $owner->owner_uid,
            ]);
        }
        $owner->update($validated);
        return back()->with('success', 'Flat owner updated successfully!');
    }










    public function delete_flat_owner(Request $request)
    {
        $request->validate([
            'owner_uid' => 'required|string|exists:flat_owners,owner_uid',
        ]);
        $owner = FlatOwner::where('owner_uid', $request->owner_uid)->first();
        Flat::where('owner_uid', $owner->owner_uid)->update(['owner_uid' => null, 'bought_at' => null]);
        foreach (['image', 'nid_front_page', 'nid_back_page'] as $field) {
            if ($owner && $owner->$field) {
                $path = str_replace('/storage/', '', $owner->$field);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }
        $owner->delete();
        return back()->with('success', 'Flat owner deleted successfully!');
    }
}
