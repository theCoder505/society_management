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
        Schema::create('appartments', function (Blueprint $table) {
            $table->id();
            $table->string('appartment_uid');
            $table->string('appartment_name')->unique();
            $table->string('appartment_location');
            $table->decimal('total_flats', 12, 2);
            $table->decimal('total_units', 12, 2);
            $table->decimal('total_lifts', 12, 2);
            $table->string('doors_open_time');
            $table->string('doors_close_time');
            $table->decimal('total_gas_lines', 12, 2);
            $table->enum('gas_systen', ['lpg', 'card', 'manual', 'other']);
            $table->enum('water_systen', ['wasa', 'submersible_pump', 'normal_pump', 'other']);
            $table->string('water_in_time')->nullable();
            $table->string('water_out_time')->nullable();
            $table->enum('garage_location', ['no_garage', 'ground_floor', 'underground']);
            $table->string('garage_size')->nullable();
            $table->string('garage_allocation')->nullable(); // for 20 people etc
            $table->text('garage_sections')->nullable(); // array
            $table->decimal('total_electricity_lines', 12, 2);
            $table->decimal('tot_solar_panels', 12, 2);
            $table->enum('terrace_option', ['open_for_all', 'owners_only']);
            $table->text('apartment_images'); // array
            $table->text('apartment_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appartments');
    }
};
