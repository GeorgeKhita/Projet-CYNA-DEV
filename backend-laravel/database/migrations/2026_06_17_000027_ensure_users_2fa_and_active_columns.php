<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'two_factor_secret')) {
                $table->text('two_factor_secret')->nullable()->after('two_factor_enabled');
            }
            if (!Schema::hasColumn('users', 'two_factor_confirmed_at')) {
                $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_secret');
            }
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('is_email_verified');
            }
            if (!Schema::hasColumn('users', 'siren')) {
                $table->string('siren', 9)->nullable()->after('company');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $cols = ['two_factor_secret', 'two_factor_confirmed_at', 'is_active', 'siren'];
            $existing = array_filter($cols, fn($c) => Schema::hasColumn('users', $c));
            if ($existing) {
                $table->dropColumn(array_values($existing));
            }
        });
    }
};
