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
        Schema::create('flats', function (Blueprint $table) {
            $table->id();
            $table->string('appartment_uid')->unique();
            $table->string('flatID')->unique();
            $table->string('owner_uid')->nullable();
            $table->enum('flat_type', ['rented', 'to_rent', 'to_live']);
            $table->string('tenant_uid')->nullable();
            $table->string('flat_price');
            $table->string('flat_size');
            $table->string('flat_bhk');
            $table->string('tot_bedrooms');
            $table->string('tot_washrooms');
            $table->string('tot_balconies');
            $table->enum('drawing_dyning_kitchen', ['all_together', 'all_seperate', 'seperate_kitchen', 'seperate_drawing']);
            $table->string('flat_images');
            $table->string('flat_3d_video')->nullable();
            $table->string('rent_price');
            $table->timestamp('bought_at');
            $table->boolean('wifi')->default(true);
            $table->boolean('dish')->default(true);
            $table->boolean('gas')->default(true);
            $table->boolean('intercom')->default(true);
            $table->boolean('lift')->default(true);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('appartment_uid')->references('appartment_uid')->on('appartments')->onDelete('cascade');
            // appartment_uid
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flats');
    }
};
