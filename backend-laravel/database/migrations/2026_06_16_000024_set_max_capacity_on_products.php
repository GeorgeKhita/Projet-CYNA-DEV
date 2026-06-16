<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('products')->whereNull('max_capacity')->update(['max_capacity' => 10]);
    }

    public function down(): void
    {
        DB::table('products')->update(['max_capacity' => null]);
    }
};
