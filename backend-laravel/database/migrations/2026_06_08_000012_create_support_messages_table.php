<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['form', 'chatbot'])->default('form');
            $table->string('email');
            $table->string('subject')->nullable();
            $table->text('message_body');
            $table->boolean('requires_human')->default(false);
            $table->enum('status', ['new', 'in_progress', 'resolved'])->default('new');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
    }
};
