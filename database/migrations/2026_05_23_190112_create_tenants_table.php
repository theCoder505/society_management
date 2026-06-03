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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_uid')->unique();
            $table->string('name');
            $table->string('image');
            $table->string('hometown');
            $table->string('permanent_addr');
            $table->string('contact');
            $table->string('email');
            $table->string('otp')->nullable();
            $table->string('password')->unique();
            $table->string('nid_front');
            $table->string('nid_back');
            $table->string('renting_flats'); // array
            $table->decimal('starting_rent_amount', 12, 2);
            $table->decimal('family_members', 12, 2);
            $table->timestamp('renting_since');
            $table->text('notes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
