<?php

use App\Http\Controllers\admin\AnnouncementController;
use App\Http\Controllers\admin\BasicPagesController;
use App\Http\Controllers\FlatOwnersController;
use App\Http\Controllers\TenantsController;
use App\Http\Controllers\PortalAuthController;
use App\Http\Controllers\TenantPortalController;
use App\Http\Controllers\OwnerPortalController;
use App\Http\Controllers\OwnerTenantController;
use App\Http\Controllers\SurfaceWebController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;




// ─── Surface Web ──────────────────────────────────────────────────────────────
Route::get('/', [SurfaceWebController::class, 'home'])->name('home');
Route::get('/contact', [SurfaceWebController::class, 'contact'])->name('contact');
Route::post('/contact', [SurfaceWebController::class, 'submitInquiry'])->name('contact.submit');




// ─── Multi-Role Auth ──────────────────────────────────────────────────────────
Route::middleware('guest:tenant,owner,web')->group(function () {
    Route::get('/login', [PortalAuthController::class, 'showLogin'])->name('portal.login');
    Route::post('/login', [PortalAuthController::class, 'login'])->name('portal.login.post');
    Route::get('/set-password', [PortalAuthController::class, 'showSetPassword'])->name('portal.set-password');
    Route::post('/set-password/send-otp', [PortalAuthController::class, 'sendOtp'])->name('portal.send-otp');
    Route::post('/set-password', [PortalAuthController::class, 'setPassword'])->name('portal.set-password.post');
});
Route::post('/logout', [PortalAuthController::class, 'logout'])->name('portal.logout');





// ─── Admin Portal ─────────────────────────────────────────────────────────────
Route::middleware(['role:admin'])->prefix('/admin')->group(function () {
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
    Route::post('/flat-owner-costs/create', [BasicPagesController::class, 'create_flat_owner_cost'])->name('costs.flat_owners.create');
    Route::put('/flat-owner-costs/update', [BasicPagesController::class, 'update_flat_owner_cost'])->name('costs.flat_owners.update');
    Route::delete('/flat-owner-costs/delete', [BasicPagesController::class, 'delete_flat_owner_cost'])->name('costs.flat_owners.delete');

    Route::get('/tenant-bills', [BasicPagesController::class, 'tenant_bills'])->name('costs.tenants');
    Route::post('/tenant-bills/create', [BasicPagesController::class, 'create_tenant_bill'])->name('costs.tenants.create');
    Route::put('/tenant-bills/update', [BasicPagesController::class, 'update_tenant_bill'])->name('costs.tenants.update');
    Route::delete('/tenant-bills/delete', [BasicPagesController::class, 'delete_tenant_bill'])->name('costs.tenants.delete');

    Route::get('/tenant-notices', [TenantsController::class, 'tenant_notices'])->name('tenants.notices');
    Route::post('/tenant-notices/create', [TenantsController::class, 'create_notice'])->name('tenants.notices.create');
    Route::put('/tenant-notices/update', [TenantsController::class, 'update_notice'])->name('tenants.notices.update');
    Route::delete('/tenant-notices/delete', [TenantsController::class, 'delete_notice'])->name('tenants.notices.delete');

    Route::get('/society-expenditure', [BasicPagesController::class, 'society_expanditure'])->name('society.costs');
    Route::post('/society-expenditure/create', [BasicPagesController::class, 'create_society_cost'])->name('society.costs.create');
    Route::put('/society-expenditure/update', [BasicPagesController::class, 'update_society_cost'])->name('society.costs.update');
    Route::delete('/society-expenditure/delete', [BasicPagesController::class, 'delete_society_cost'])->name('society.costs.delete');

    Route::get('/society-announcement', [AnnouncementController::class, 'announcements'])->name('society.announcements.all');
    Route::post('/society-announcement/create', [AnnouncementController::class, 'create_announcement'])->name('society.announcement.create');
    Route::put('/society-announcement/update', [AnnouncementController::class, 'update_announcement'])->name('society.announcement.update');
    Route::delete('/society-announcement/delete', [AnnouncementController::class, 'delete_announcement'])->name('society.announcement.delete');
});





// ─── Flat Owner Portal ────────────────────────────────────────────────────────
Route::middleware(['role:owner'])->prefix('/owner')->name('owner.')->group(function () {
    Route::get('/dashboard', [OwnerPortalController::class, 'dashboard'])->name('dashboard');

    Route::get('/my-flats', [OwnerPortalController::class, 'myFlats'])->name('my-flats');
    Route::patch('/my-flats/{flat}/status', [OwnerPortalController::class, 'updateFlatStatus'])->name('my-flats.update-status');

    Route::get('/my-apartments', [OwnerPortalController::class, 'myApartments'])->name('my-apartments');

    Route::get('/tenants', [OwnerTenantController::class, 'all_tenants'])->name('tenants.index');
    Route::post('/tenants/create', [OwnerTenantController::class, 'create_tenant'])->name('tenants.create');
    Route::get('/tenants/{owner_uid}', [OwnerTenantController::class, 'spec_tenant'])->name('tenants.read');
    Route::post('/tenants/update', [OwnerTenantController::class, 'update_tenant'])->name('tenants.update');
    Route::delete('/tenants/delete', [OwnerTenantController::class, 'delete_tenant'])->name('tenants.delete');

    Route::get('/tenant-payments', [OwnerPortalController::class, 'tenantPayments'])->name('tenant-payments');
    Route::post('/tenant-payments/verify', [OwnerPortalController::class, 'verifyPayment'])->name('tenant-payments.verify');

    Route::get('/notices', [OwnerPortalController::class, 'notices'])->name('notices');
    Route::post('/notices/create', [OwnerPortalController::class, 'createNotice'])->name('notices.create');
    Route::put('/notices/update', [OwnerPortalController::class, 'updateNotice'])->name('notices.update');
    Route::delete('/notices/delete', [OwnerPortalController::class, 'deleteNotice'])->name('notices.delete');

    Route::get('/service-requests', [OwnerPortalController::class, 'serviceRequests'])->name('service-requests');
    Route::post('/service-requests/create', [OwnerPortalController::class, 'createAdminServiceRequest'])->name('service-requests.create');
    Route::post('/service-requests/update-tenant', [OwnerPortalController::class, 'updateTenantServiceRequest'])->name('service-requests.update-tenant');
    Route::post('/service-requests/update-admin', [OwnerPortalController::class, 'updateAdminServiceRequest'])->name('service-requests.update-admin');
    Route::delete('/service-requests/delete-admin', [OwnerPortalController::class, 'deleteAdminServiceRequest'])->name('service-requests.delete-admin');

    Route::get('/profile', [OwnerPortalController::class, 'profile'])->name('profile');
    Route::post('/profile/update', [OwnerPortalController::class, 'updateProfile'])->name('profile.update');
    Route::post('/profile/send-otp', [OwnerPortalController::class, 'sendProfileOtp'])->name('profile.send-otp');
    Route::post('/profile/update-email', [OwnerPortalController::class, 'updateEmail'])->name('profile.update-email');
    Route::post('/profile/update-password', [OwnerPortalController::class, 'updatePassword'])->name('profile.update-password');
});





// ─── Tenant Portal ────────────────────────────────────────────────────────────
Route::middleware(['role:tenant'])->prefix('/tenant')->name('tenant.')->group(function () {
    Route::get('/dashboard', [TenantPortalController::class, 'dashboard'])->name('dashboard');

    Route::get('/my-flats', [TenantPortalController::class, 'myFlats'])->name('my-flats');
    Route::get('/my-apartment', [TenantPortalController::class, 'myApartment'])->name('my-apartment');

    Route::get('/payments', [TenantPortalController::class, 'payments'])->name('payments');
    Route::post('/payments/upload', [TenantPortalController::class, 'uploadPayment'])->name('payments.upload');
    Route::delete('/payments/delete', [TenantPortalController::class, 'deletePayment'])->name('payments.delete');

    Route::get('/notices', [TenantPortalController::class, 'notices'])->name('notices');
    Route::post('/notices/comply', [TenantPortalController::class, 'complyNotice'])->name('notices.comply');

    Route::get('/service-requests', [TenantPortalController::class, 'serviceRequests'])->name('service-requests');
    Route::post('/service-requests/create', [TenantPortalController::class, 'createServiceRequest'])->name('service-requests.create');
    Route::post('/service-requests/update', [TenantPortalController::class, 'updateServiceRequest'])->name('service-requests.update');
    Route::delete('/service-requests/delete', [TenantPortalController::class, 'deleteServiceRequest'])->name('service-requests.delete');

    Route::get('/profile', [TenantPortalController::class, 'profile'])->name('profile');
    Route::post('/profile/update', [TenantPortalController::class, 'updateProfile'])->name('profile.update');
    Route::post('/profile/send-otp', [TenantPortalController::class, 'sendProfileOtp'])->name('profile.send-otp');
    Route::post('/profile/update-email', [TenantPortalController::class, 'updateEmail'])->name('profile.update-email');
    Route::post('/profile/update-password', [TenantPortalController::class, 'updatePassword'])->name('profile.update-password');
});



Route::get('/clear', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('config:cache');
    Artisan::call('view:clear');
    Artisan::call('route:clear'); 
    Artisan::call('storage:link');
    return "Cleared!";
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
