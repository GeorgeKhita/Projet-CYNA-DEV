<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remplit les entreprises manquantes AVANT de passer la colonne en NOT NULL,
        // sinon la migration échoue sur les utilisateurs existants (company = NULL).
        DB::table('users')->whereNull('company')->update(['company' => 'Non renseignée']);

        Schema::table('users', function (Blueprint $table) {
            $table->string('company', 150)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company', 150)->nullable()->change();
        });
    }
};
