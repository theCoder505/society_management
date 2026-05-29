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
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->string('notice_uid');
            $table->string('from_owner_uid');
            $table->string('to_tenant_uid');
            $table->string('title');
            $table->string('notice_details');
            $table->boolean('is_complied')->default(false);
            $table->timestamp('complied_at')->nullable();
            $table->timestamps();
            $table->foreign('to_tenant_uid')->references('tenant_uid')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};
