<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('flat_owners', function (Blueprint $table) {
            $table->id();
            $table->string('owner_uid')->unique();
            $table->string('name');
            $table->string('image');
            $table->string('nid_front_page');
            $table->string('nid_back_page');
            $table->string('hometown');
            $table->text('permanent_addr');
            $table->string('contact_number');
            $table->string('email')->unique();
            $table->string('otp')->nullable();
            $table->string('password')->nullable();
            $table->string('appartments'); // array
            $table->string('flats'); // array
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('flat_owners');
    }
};
