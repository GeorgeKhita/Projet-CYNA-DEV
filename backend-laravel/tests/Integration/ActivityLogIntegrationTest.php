<?php

namespace Tests\Integration;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_record_helper_persists_a_log(): void
    {
        $user = User::factory()->create();

        ActivityLog::record($user->id, 'product_created', 'Produit créé : CYNA SOC', '127.0.0.1');

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action'  => 'product_created',
            'detail'  => 'Produit créé : CYNA SOC',
        ]);
    }

    public function test_record_returns_the_created_log(): void
    {
        $user = User::factory()->create();

        $log = ActivityLog::record($user->id, 'login', 'Connexion réussie');

        $this->assertInstanceOf(ActivityLog::class, $log);
        $this->assertSame('login', $log->action);
    }

    public function test_log_belongs_to_user(): void
    {
        $user = User::factory()->create(['email' => 'admin@cyna.fr']);
        $log  = ActivityLog::record($user->id, 'test_action');

        $this->assertSame('admin@cyna.fr', $log->user->email);
    }
}
