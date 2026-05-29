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
        Schema::create('flat_owner_costs', function (Blueprint $table) {
            $table->id();
            $table->string('cost_uid')->unique();
            $table->string('owner_uid');
            $table->string('amount');
            $table->enum('cost_type', ['monthly_fee', 'installment', 'maintainance', 'service_cost', 'development_fee']);
            $table->string('development_uid')->nullable();
            $table->timestamps();
            $table->foreign('owner_uid')->references('owner_uid')->on('flat_owners')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flat_owner_costs');
    }
};
