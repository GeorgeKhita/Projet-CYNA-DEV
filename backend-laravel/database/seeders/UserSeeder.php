<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@cyna-it.fr'],
            [
                'first_name'        => 'Admin',
                'last_name'         => 'CYNA',
                'email'             => 'admin@cyna-it.fr',
                'password'          => Hash::make('Admin1234!'),
                'company'           => 'CYNA IT',
                'role'              => 'admin',
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        // Utilisateurs test
        $users = [
            [
                'first_name'        => 'Jean',
                'last_name'         => 'Dupont',
                'email'             => 'jean.dupont@entreprise.fr',
                'password'          => Hash::make('User1234!'),
                'company'           => 'Dupont & Associés SAS',
                'role'              => 'user',
                'is_active'         => true,
                'email_verified_at' => now(),
            ],
            [
                'first_name'        => 'Marie',
                'last_name'         => 'Martin',
                'email'             => 'marie.martin@techcorp.fr',
                'password'          => Hash::make('User1234!'),
                'company'           => 'TechCorp SARL',
                'role'              => 'user',
                'is_active'         => true,
                'email_verified_at' => now(),
            ],
            [
                'first_name'        => 'Pierre',
                'last_name'         => 'Bernard',
                'email'             => 'p.bernard@consulting.fr',
                'password'          => Hash::make('User1234!'),
                'company'           => 'Bernard Consulting',
                'role'              => 'user',
                'is_active'         => true,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
