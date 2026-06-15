<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homepage_carousel', function (Blueprint $table) {
            $table->boolean('active')->default(true)->after('display_order');
        });
    }

    public function down(): void
    {
        Schema::table('homepage_carousel', function (Blueprint $table) {
            $table->dropColumn('active');
        });
    }
};
