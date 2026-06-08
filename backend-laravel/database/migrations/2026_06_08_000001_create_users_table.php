<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 150)->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('company', 150)->nullable();
            $table->enum('role', ['user', 'admin'])->default('user');
            $table->boolean('two_factor_enabled')->default(false);
            $table->boolean('is_email_verified')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
