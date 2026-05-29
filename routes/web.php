<?php

use App\Http\Controllers\admin\AnnouncementController;
use App\Http\Controllers\admin\BasicPagesController;
use App\Http\Controllers\FlatOwnersController;
use App\Http\Controllers\TenantsController;
use App\Models\Announcement;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');



Route::middleware(['auth'])->prefix('/admin')->group(function () {
    Route::get('/dashboard', [BasicPagesController::class, 'dashboard'])->name('dashboard');

    Route::get('/society-settings', [BasicPagesController::class, 'appSettings'])->name('settings.index');
    Route::post('/society-settings', [BasicPagesController::class, 'updateSettings'])->name('settings.update');


    Route::get('/apartments', [BasicPagesController::class, 'all_apartments'])->name('apartments.index');
    Route::post('/apartments/create', [BasicPagesController::class, 'create_apartment'])->name('apartments.create');
    Route::get('/apartments/{appartment_uid}', [BasicPagesController::class, 'spec_apartment'])->name('apartments.read');
    Route::put('/apartments/update', [BasicPagesController::class, 'update_apartment'])->name('apartments.update');
    Route::delete('/apartments/delete', [BasicPagesController::class, 'delete_apartment'])->name('apartments.delete');



    Route::get('/flats', [BasicPagesController::class, 'all_flats'])->name('flats.index');
    Route::post('/flats/create', [BasicPagesController::class, 'create_flat'])->name('flats.create');
    Route::get('/flats/{flatID}', [BasicPagesController::class, 'spec_flat'])->name('flats.read');
    Route::put('/flats/update', [BasicPagesController::class, 'update_flat'])->name('flats.update');
    Route::delete('/flats/delete', [BasicPagesController::class, 'delete_flat'])->name('flats.delete');



    Route::get('/flat-owners', [FlatOwnersController::class, 'all_owners'])->name('flat_owners.index');
    Route::post('/flat-owners/create', [FlatOwnersController::class, 'create_flat_owner'])->name('flat_owners.create');
    Route::get('/flat-owners/{owner_uid}', [FlatOwnersController::class, 'spec_flat_owner'])->name('flat_owners.read');
    Route::post('/flat-owners/update', [FlatOwnersController::class, 'update_flat_owner'])->name('flat_owners.update');
    Route::delete('/flat-owners/delete', [FlatOwnersController::class, 'delete_flat_owner'])->name('flat_owners.delete');


    Route::get('/tenants1', [TenantsController::class, 'tenants1'])->name('tenants.index1');
    Route::get('/tenants', [TenantsController::class, 'all_tenants'])->name('tenants.index');
    Route::post('/tenants/create', [TenantsController::class, 'create_tenant'])->name('tenants.create');
    Route::get('/tenants/{owner_uid}', [TenantsController::class, 'spec_tenant'])->name('tenants.read');
    Route::post('/tenants/update', [TenantsController::class, 'update_tenant'])->name('tenants.update');
    Route::delete('/tenants/delete', [TenantsController::class, 'delete_tenant'])->name('tenants.delete');
    
    
    
    Route::get('/flat-owner-costs', [BasicPagesController::class, 'flat_owner_costs'])->name('costs.flat_owners');
    Route::get('/tenant-bills', [BasicPagesController::class, 'tenant_bills'])->name('costs.tenants');
    Route::get('/tenant-notices', [TenantsController::class, 'tenant_notices'])->name('tenants.notices');
    Route::get('/society-expenditure', [BasicPagesController::class, 'society_expanditure'])->name('society.costs');

    Route::get('/society-announcement', [AnnouncementController::class, 'announcements'])->name('society.announcements.all');
    Route::post('/society-announcement/create', [AnnouncementController::class, 'create_announcement'])->name('society.announcement.create');
    Route::put('/society-announcement/update', [AnnouncementController::class, 'update_announcement'])->name('society.announcement.update');
    Route::delete('/society-announcement/delete', [AnnouncementController::class, 'delete_announcement'])->name('society.announcement.delete');

});







Route::get('/clear', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('config:cache');
    Artisan::call('view:clear');
    Artisan::call('storage:link');
    return "Cleared!";
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
