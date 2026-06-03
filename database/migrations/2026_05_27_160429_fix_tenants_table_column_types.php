<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->json('starting_rent_amount')->nullable()->change();
            $table->unsignedInteger('family_members')->nullable()->change();
            $table->string('image')->nullable()->change();
            $table->string('renting_since')->nullable()->change();
            $table->text('notes')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->decimal('starting_rent_amount', 12, 2)->nullable()->change();
            $table->decimal('family_members', 12, 2)->nullable()->change();
        });
    }
};