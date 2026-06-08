<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_sub_id', 100)->nullable()->unique();
            $table->enum('status', ['active', 'cancelled', 'past_due', 'expired'])->default('active');
            $table->enum('billing_cycle', ['monthly', 'annual'])->default('monthly');
            $table->date('current_period_start');
            $table->date('current_period_end');
            $table->dateTime('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
