<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Appartment;
use App\Models\AppSetting;
use App\Models\Flat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BasicPagesController extends Controller
{



    public function dashboard()
    {
        $data = [];
        return Inertia::render('dashboard', compact('data'));
    }




    public function appSettings()
    {
        $settings = AppSetting::where('id', 1)->first();
        return Inertia::render('admin/app_settings', compact('settings'));
    }







    public function updateSettings(Request $request)
    {
        $request->validate([
            'brand_name'       => ['required', 'string', 'max:255'],
            'brand_logo'       => ['nullable', 'image', 'mimes:png', 'max:10240'], // max 10 MB
            'brand_icon'       => ['nullable', 'image', 'mimes:png', 'max:10240'], // max 10 MB
            'location'         => ['nullable', 'string', 'max:500'],
            'gogle_map'        => ['nullable', 'max:2000'],
            'facebook'         => ['nullable', 'url', 'max:500'],
            'instagram'        => ['nullable', 'url', 'max:500'],
            'twitter'          => ['nullable', 'url', 'max:500'],
            'linkedin'         => ['nullable', 'url', 'max:500'],
            'contact_email'    => ['nullable', 'email', 'max:255'],
            'about'            => ['nullable', 'string'],
            'privacy_policy'   => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
        ], [
            'brand_name.required' => 'Brand name is required.',
            'brand_logo.mimes'    => 'Brand logo must be a PNG image.',
            'brand_logo.max'      => 'Brand logo must not exceed 10 MB.',
            'brand_icon.mimes'    => 'Brand icon must be a PNG image.',
            'brand_icon.max'      => 'Brand icon must not exceed 10 MB.',
            'gogle_map.url'       => 'Google Maps must be a valid URL.',
            'facebook.url'        => 'Facebook must be a valid URL.',
            'instagram.url'       => 'Instagram must be a valid URL.',
            'twitter.url'         => 'Twitter must be a valid URL.',
            'linkedin.url'        => 'LinkedIn must be a valid URL.',
            'contact_email.email' => 'Contact email must be a valid email address.',
        ]);

        $settings = AppSetting::where('id', 1)->firstOrFail();

        $brandNameChanged = $settings->brand_name !== $request->brand_name;
        $brandLogoChanged = $request->hasFile('brand_logo');
        $brandIconChanged = $request->hasFile('brand_icon');
        $brandChanged     = $brandNameChanged || $brandLogoChanged || $brandIconChanged;

        if ($brandLogoChanged) {
            $assetsDir = public_path('assets');
            if (!is_dir($assetsDir)) mkdir($assetsDir, 0755, true);
            $request->file('brand_logo')->move($assetsDir, 'logo.png');
            $settings->brand_logo = '/assets/logo.png';
        }

        if ($brandIconChanged) {
            $assetsDir = public_path('assets');
            if (!is_dir($assetsDir)) mkdir($assetsDir, 0755, true);
            $request->file('brand_icon')->move($assetsDir, 'icon.png');
            $settings->brand_icon = '/assets/icon.png';
        }

        $settings->brand_name       = $request->brand_name;
        $settings->location         = $request->location;
        $settings->gogle_map        = $request->gogle_map;
        $settings->facebook         = $request->facebook;
        $settings->instagram        = $request->instagram;
        $settings->twitter          = $request->twitter;
        $settings->linkedin         = $request->linkedin;
        $settings->contact_email    = $request->contact_email;
        $settings->about            = $request->about;
        $settings->privacy_policy   = $request->privacy_policy;
        $settings->terms_conditions = $request->terms_conditions;
        $settings->save();

        if ($brandChanged) {
            if ($brandNameChanged) {
                $envPath    = base_path('.env');
                $envContent = file_get_contents($envPath);
                $envContent = preg_replace(
                    '/^APP_NAME=.*/m',
                    'APP_NAME="' . addslashes($request->brand_name) . '"',
                    $envContent
                );
                file_put_contents($envPath, $envContent);
            }

            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');
        }

        return back()->with('success', 'Updated!');
    }














    public function all_apartments()
    {
        $apartments = Appartment::all();
        return Inertia::render('admin/apartments', compact('apartments'));
    }

    public function create_apartment(Request $request)
    {
        $validated = $request->validate([
            'appartment_uid'          => 'required|string|unique:appartments,appartment_uid',
            'appartment_name'         => 'required|string|unique:appartments,appartment_name',
            'appartment_location'     => 'required|string',
            'total_flats'             => 'required|numeric|min:0',
            'total_units'             => 'required|numeric|min:0',
            'total_lifts'             => 'required|numeric|min:0',
            'doors_open_time'         => 'required|string',
            'doors_close_time'        => 'required|string',
            'total_gas_lines'         => 'required|numeric|min:0',
            'gas_systen'              => 'required|in:lpg,card,manual,other',
            'water_systen'            => 'required|in:wasa,submersible_pump,normal_pump,other',
            'water_in_time'           => 'nullable|string',
            'water_out_time'          => 'nullable|string',
            'garage_location'         => 'required|in:no_garage,ground_floor,underground',
            'garage_size'             => 'nullable|string',
            'garage_allocation'       => 'nullable|string',
            'garage_sections'         => 'nullable|string',
            'total_electricity_lines' => 'required|numeric|min:0',
            'tot_solar_panels'        => 'required|numeric|min:0',
            'terrace_option'          => 'required|in:open_for_all,owners_only',
            'apartment_images'        => 'nullable|array|max:10',
            'apartment_images.*'      => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'apartment_notes'         => 'nullable|string',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('apartment_images')) {
            foreach ($request->file('apartment_images') as $image) {
                $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('apartments', $filename, 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $validated['apartment_images'] = implode(',', $imagePaths);

        Appartment::create($validated);

        return back()->with('success', 'Apartment created successfully!');
    }

    public function spec_apartment($appartment_uid)
    {
        $apartment = Appartment::where('appartment_uid', $appartment_uid)->firstOrFail();
        return Inertia::render('admin/apartment-detail', compact('apartment'));
    }

    public function update_apartment(Request $request)
    {
        $validated = $request->validate([
            'appartment_uid'          => 'required|string|exists:appartments,appartment_uid',
            'appartment_name'         => 'required|string|unique:appartments,appartment_name,' . Appartment::where('appartment_uid', $request->appartment_uid)->value('id'),
            'appartment_location'     => 'required|string',
            'total_flats'             => 'required|numeric|min:0',
            'total_units'             => 'required|numeric|min:0',
            'total_lifts'             => 'required|numeric|min:0',
            'doors_open_time'         => 'required|string',
            'doors_close_time'        => 'required|string',
            'total_gas_lines'         => 'required|numeric|min:0',
            'gas_systen'              => 'required|in:lpg,card,manual,other',
            'water_systen'            => 'required|in:wasa,submersible_pump,normal_pump,other',
            'water_in_time'           => 'nullable|string',
            'water_out_time'          => 'nullable|string',
            'garage_location'         => 'required|in:no_garage,ground_floor,underground',
            'garage_size'             => 'nullable|string',
            'garage_allocation'       => 'nullable|string',
            'garage_sections'         => 'nullable|string',
            'total_electricity_lines' => 'required|numeric|min:0',
            'tot_solar_panels'        => 'required|numeric|min:0',
            'terrace_option'          => 'required|in:open_for_all,owners_only',
            'apartment_images'        => 'nullable|array|max:10',
            'apartment_images.*'      => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'existing_images'         => 'nullable|string',
            'apartment_notes'         => 'nullable|string',
        ]);

        $apartment = Appartment::where('appartment_uid', $validated['appartment_uid'])->first();

        // Handle existing images
        $existingImages = [];
        if ($request->has('existing_images') && !empty($request->existing_images)) {
            $existingImages = explode(',', $request->existing_images);
            $existingImages = array_filter($existingImages);
        }

        // Handle new image uploads
        $newImagePaths = [];
        if ($request->hasFile('apartment_images')) {
            foreach ($request->file('apartment_images') as $image) {
                $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('apartments', $filename, 'public');
                $newImagePaths[] = '/storage/' . $path;
            }
        }

        // Combine existing and new images
        $allImages = array_merge($existingImages, $newImagePaths);
        $validated['apartment_images'] = implode(',', $allImages);

        // Delete old images that were removed
        if ($apartment && $apartment->apartment_images) {
            $oldImages = explode(',', $apartment->apartment_images);
            $removedImages = array_diff($oldImages, $existingImages);

            foreach ($removedImages as $removedImage) {
                $path = str_replace('/storage/', '', $removedImage);
                Storage::disk('public')->delete($path);
            }
        }

        $apartment->update($validated);

        return back()->with('success', 'Apartment updated successfully!');
    }

    public function delete_apartment(Request $request)
    {
        $request->validate([
            'appartment_uid' => 'required|string|exists:appartments,appartment_uid',
        ]);

        $apartment = Appartment::where('appartment_uid', $request->appartment_uid)->first();

        // Delete all associated images
        if ($apartment && $apartment->apartment_images) {
            $images = explode(',', $apartment->apartment_images);
            foreach ($images as $image) {
                $path = str_replace('/storage/', '', $image);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $apartment->delete();

        return back()->with('success', 'Apartment deleted successfully!');
    }












    public function all_flats()
    {
        $flats = Flat::all();
        $apartments = Appartment::all(['id', 'appartment_uid', 'appartment_name']);
        return Inertia::render('admin/flats', compact('flats', 'apartments'));
    }


    public function create_flat(Request $request)
    {
        $validated = $request->validate([
            'appartment_uid'         => 'required|string|exists:appartments,appartment_uid',
            'flatID'                 => 'required|string|unique:flats,flatID',
            'tenant_uid'             => 'nullable|string',
            'flat_price'             => 'required|numeric|min:0',
            'flat_size'              => 'required|numeric|min:0',
            'flat_bhk'               => 'required|numeric|min:0',
            'tot_bedrooms'           => 'required|numeric|min:0',
            'tot_washrooms'          => 'required|numeric|min:0',
            'tot_balconies'          => 'required|numeric|min:0',
            'drawing_dyning_kitchen' => 'required|in:all_together,all_seperate,seperate_kitchen,seperate_drawing',
            'flat_images'            => 'nullable|array|max:10',
            'flat_images.*'          => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'flat_3d_video'          => 'nullable|url',
            'rent_price'             => 'nullable|numeric|min:0',
            'wifi'                   => 'required|in:yes,no',
            'dish'                   => 'required|in:yes,no',
            'gas'                    => 'required|in:yes,no',
            'intercom'               => 'required|in:yes,no',
            'lift'                   => 'required|in:yes,no',
            'note'                   => 'nullable|string',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('flat_images')) {
            foreach ($request->file('flat_images') as $image) {
                $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('flats', $filename, 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $validated['flat_type'] = 'to_live';
        $validated['flat_images'] = implode(',', $imagePaths);

        Flat::create($validated);

        return back()->with('success', 'Flat created successfully!');
    }



    public function spec_flat($flatID)
    {
        $flat = Flat::where('flatID', $flatID)->firstOrFail();
        return Inertia::render('admin/flat-detail', compact('flat'));
    }



    public function update_flat(Request $request)
    {
        $validated = $request->validate([
            'flatID'                 => 'required|string|exists:flats,flatID',
            'appartment_uid'         => 'required|string|exists:appartments,appartment_uid',
            'flat_type'              => 'required|in:rented,to_rent,to_live',
            'tenant_uid'             => 'nullable|string',
            'flat_price'             => 'required|numeric|min:0',
            'flat_size'              => 'required|numeric|min:0',
            'flat_bhk'               => 'required|numeric|min:0',
            'tot_bedrooms'           => 'required|numeric|min:0',
            'tot_washrooms'          => 'required|numeric|min:0',
            'tot_balconies'          => 'required|numeric|min:0',
            'drawing_dyning_kitchen' => 'required|in:all_together,all_seperate,seperate_kitchen,seperate_drawing',
            'flat_images'            => 'nullable|array|max:10',
            'flat_images.*'          => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'existing_images'        => 'nullable|string',
            'flat_3d_video'          => 'nullable|url',
            'rent_price'             => 'nullable|numeric|min:0',
            'wifi'                   => 'required|in:yes,no',
            'dish'                   => 'required|in:yes,no',
            'gas'                    => 'required|in:yes,no',
            'intercom'               => 'required|in:yes,no',
            'lift'                   => 'required|in:yes,no',
            'note'                   => 'nullable|string',
        ]);

        $flat = Flat::where('flatID', $validated['flatID'])->first();

        // Handle existing images
        $existingImages = [];
        if ($request->has('existing_images') && !empty($request->existing_images)) {
            $existingImages = array_filter(explode(',', $request->existing_images));
        }

        // Handle new image uploads
        $newImagePaths = [];
        if ($request->hasFile('flat_images')) {
            foreach ($request->file('flat_images') as $image) {
                $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('flats', $filename, 'public');
                $newImagePaths[] = '/storage/' . $path;
            }
        }

        // Combine existing and new images
        $allImages = array_merge($existingImages, $newImagePaths);
        $validated['flat_images'] = implode(',', $allImages);

        // Delete removed old images
        if ($flat && $flat->flat_images) {
            $oldImages = explode(',', $flat->flat_images);
            $removedImages = array_diff($oldImages, $existingImages);

            foreach ($removedImages as $removedImage) {
                $path = str_replace('/storage/', '', $removedImage);
                Storage::disk('public')->delete($path);
            }
        }
        $flat->update($validated);
        return back()->with('success', 'Flat updated successfully!');
    }





    public function delete_flat(Request $request)
    {
        $request->validate([
            'flatID' => 'required|string|exists:flats,flatID',
        ]);
        $flat = Flat::where('flatID', $request->flatID)->first();
        if ($flat && $flat->flat_images) {
            $images = explode(',', $flat->flat_images);
            foreach ($images as $image) {
                $path = str_replace('/storage/', '', $image);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }
        $flat->delete();
        return back()->with('success', 'Flat deleted successfully!');
    }








    public function flat_owner_costs(){
        $data = [];
        return Inertia::render('admin/flat_owner_costs', compact('data'));
    }



    public function tenant_bills(){
        $data = [];
        return Inertia::render('admin/tenant_bills', compact('data'));
    }



    public function society_expanditure(){
        $data = [];
        return Inertia::render('admin/society_costs', compact('data'));
    }






    //
}
