<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('address1', 200)->nullable();
            $table->string('address2', 200)->nullable();
            $table->string('city', 100);
            $table->string('region', 100)->nullable();
            $table->string('postal_code', 20);
            $table->char('country', 2);
            $table->string('phone_number', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
