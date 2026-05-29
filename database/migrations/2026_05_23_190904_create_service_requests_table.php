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
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('service_uid');
            $table->string('from_tenant_uid');
            $table->string('to_owner_uid');
            $table->string('title');
            $table->string('requet_details');
            $table->enum('approve_status', [0, 1])->default(0);
            $table->timestamps();
            $table->foreign('from_tenant_uid')->references('tenant_uid')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
