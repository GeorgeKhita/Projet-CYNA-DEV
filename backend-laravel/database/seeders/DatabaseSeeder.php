<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);

        // Utilisateur admin de test
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@cyna-it.fr'],
            [
                'first_name'        => 'Admin',
                'last_name'         => 'CYNA',
                'email'             => 'admin@cyna-it.fr',
                'password'          => Hash::make('Admin1234!'),
                'company'           => 'CYNA',
                'role'              => 'admin',
                'is_email_verified' => true,
                'is_active'         => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]
        );

        $this->command->info('✓ Base peuplée : 3 catégories, 6 produits, 1 admin.');
    }
}
