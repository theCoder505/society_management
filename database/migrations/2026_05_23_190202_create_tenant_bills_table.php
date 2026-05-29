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
        Schema::create('tenant_bills', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->string('tenant_uid');
            $table->string('amount');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad', 'rocket', 'card', 'other']);
            $table->enum('bill_type', ['monthly', 'electricity', 'water', 'gas', 'wifi', 'dish', 'garage', 'utility', 'other']);
            $table->enum('sent_money_to', ['flat_owner', 'guard', 'society_lead', 'other']);
            $table->text('note')->nullable();
            $table->timestamps();
            $table->foreign('tenant_uid')->references('tenant_uid')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_bills');
    }
};
