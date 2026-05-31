<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update tenant_bills
        Schema::table('tenant_bills', function (Blueprint $table) {
            if (!Schema::hasColumn('tenant_bills', 'status')) {
                $table->enum('status', ['pending', 'accepted', 'denied'])->default('pending')->after('amount');
            }
            if (!Schema::hasColumn('tenant_bills', 'billing_month')) {
                $table->string('billing_month', 7)->nullable()->after('status'); // YYYY-MM
            }
            if (!Schema::hasColumn('tenant_bills', 'is_admin_modified')) {
                $table->boolean('is_admin_modified')->default(false)->after('note');
            }
        });

        // Update tenants
        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'profile_status')) {
                $table->enum('profile_status', ['verified', 'tenant-modified'])->default('verified')->after('notes');
            }
        });

        // Update flat_owners
        Schema::table('flat_owners', function (Blueprint $table) {
            if (!Schema::hasColumn('flat_owners', 'profile_status')) {
                $table->enum('profile_status', ['verified', 'owner-modified'])->default('verified')->after('flats');
            }
        });

        // Update service_requests
        Schema::table('service_requests', function (Blueprint $table) {
            // Make existing columns nullable
            $table->string('from_tenant_uid')->nullable()->change();
            $table->string('to_owner_uid')->nullable()->change();

            if (!Schema::hasColumn('service_requests', 'from_owner_uid')) {
                $table->string('from_owner_uid')->nullable()->after('from_tenant_uid');
            }
            if (!Schema::hasColumn('service_requests', 'to_admin')) {
                $table->boolean('to_admin')->default(false)->after('to_owner_uid');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_bills', function (Blueprint $table) {
            $table->dropColumn(['status', 'billing_month', 'is_admin_modified']);
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['profile_status']);
        });

        Schema::table('flat_owners', function (Blueprint $table) {
            $table->dropColumn(['profile_status']);
        });

        Schema::table('service_requests', function (Blueprint $table) {
            $table->string('from_tenant_uid')->nullable(false)->change();
            $table->string('to_owner_uid')->nullable(false)->change();
            $table->dropColumn(['from_owner_uid', 'to_admin']);
        });
    }
};
