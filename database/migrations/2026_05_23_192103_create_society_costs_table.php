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
        Schema::create('society_costs', function (Blueprint $table) {
            $table->id();
            $table->string('cost_uid');
            $table->enum('cost_type', ['guard_fee', 'development_fee', 'lift_fee', 'monthly_fee', 'new_installation', 'other']);
            $table->string('development_uid')->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad', 'rocket', 'card', 'other']);
            $table->longText('cost_details')->nullable();
            $table->foreign('development_uid')->references('development_uid')->on('society_developments')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('society_costs');
    }
};
