<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    // ── Helpers ───────────────────────────────────────────────────────────

    private function createAdmin(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role'      => 'admin',
            'is_active' => true,
            'password'  => bcrypt('AdminPass123!'),
        ], $attributes));
    }

    private function createAdminWith2FA(): array
    {
        $google2fa = new Google2FA();
        $secret    = $google2fa->generateSecretKey();

        $admin = $this->createAdmin([
            'two_factor_secret'       => encrypt($secret),
            'two_factor_enabled'      => true,
            'two_factor_confirmed_at' => now(),
        ]);

        return [$admin, $secret];
    }

    private function validCode(string $secret): string
    {
        return (new Google2FA())->getCurrentOtp($secret);
    }

    private function adminToken(User $admin): string
    {
        return $admin->createToken('test')->plainTextToken;
    }

    // ══════════════════════════════════════════════════════════════════════
    // SETUP — POST /api/auth/admin/setup-2fa
    // ══════════════════════════════════════════════════════════════════════

    public function test_admin_can_start_2fa_setup(): void
    {
        $admin = $this->createAdmin();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->postJson('/api/auth/admin/setup-2fa')
            ->assertStatus(200)
            ->assertJsonStructure(['message', 'qr_code', 'secret_key']);

        $admin->refresh();
        $this->assertNotNull($admin->two_factor_secret);
        $this->assertFalse((bool) $admin->two_factor_enabled);
        $this->assertNull($admin->two_factor_confirmed_at);
    }

    public function test_setup_2fa_returns_svg_qr_code(): void
    {
        $admin = $this->createAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->postJson('/api/auth/admin/setup-2fa')
            ->assertStatus(200);

        $qrCode = $response->json('qr_code');
        $this->assertStringStartsWith('data:image/svg+xml;base64,', $qrCode);
    }

    public function test_non_admin_cannot_setup_2fa(): void
    {
        $user  = User::factory()->create(['role' => 'user', 'is_active' => true]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/admin/setup-2fa')
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_setup_2fa(): void
    {
        $this->postJson('/api/auth/admin/setup-2fa')
            ->assertStatus(401);
    }

    // ══════════════════════════════════════════════════════════════════════
    // CONFIRM — POST /api/auth/admin/confirm-2fa
    // ══════════════════════════════════════════════════════════════════════

    public function test_admin_can_confirm_2fa_with_valid_code(): void
    {
        $google2fa = new Google2FA();
        $secret    = $google2fa->generateSecretKey();

        $admin = $this->createAdmin([
            'two_factor_secret'       => encrypt($secret),
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->postJson('/api/auth/admin/confirm-2fa', [
                'code' => $this->validCode($secret),
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Authentification à deux facteurs activée avec succès.']);

        $admin->refresh();
        $this->assertTrue($admin->two_factor_enabled);
        $this->assertNotNull($admin->two_factor_confirmed_at);
    }

    public function test_confirm_2fa_fails_with_invalid_code(): void
    {
        $google2fa = new Google2FA();
        $secret    = $google2fa->generateSecretKey();

        $admin = $this->createAdmin([
            'two_factor_secret'       => encrypt($secret),
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->postJson('/api/auth/admin/confirm-2fa', ['code' => '000000'])
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Code invalide. Assurez-vous que l\'heure de votre appareil est correcte.']);

        $admin->refresh();
        $this->assertFalse((bool) $admin->two_factor_enabled);
    }

    public function test_confirm_2fa_fails_without_prior_setup(): void
    {
        $admin = $this->createAdmin([
            'two_factor_secret'       => null,
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->postJson('/api/auth/admin/confirm-2fa', ['code' => '123456'])
            ->assertStatus(422);
    }

    public function test_confirm_2fa_requires_exactly_6_digits(): void
    {
        $admin = $this->createAdmin();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->postJson('/api/auth/admin/confirm-2fa', ['code' => '12345'])
            ->assertStatus(422);
    }

    public function test_non_admin_cannot_confirm_2fa(): void
    {
        $user  = User::factory()->create(['role' => 'user', 'is_active' => true]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/admin/confirm-2fa', ['code' => '123456'])
            ->assertStatus(403);
    }

    // ══════════════════════════════════════════════════════════════════════
    // LOGIN — POST /api/auth/login (avec 2FA)
    // ══════════════════════════════════════════════════════════════════════

    public function test_admin_with_2fa_enabled_gets_pending_token_on_login(): void
    {
        [$admin] = $this->createAdminWith2FA();

        $response = $this->postJson('/api/auth/login', [
            'email'    => $admin->email,
            'password' => 'AdminPass123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['requires_2fa' => true])
            ->assertJsonStructure(['requires_2fa', 'pending_token', 'message']);

        $pendingToken = $response->json('pending_token');
        $this->assertNotEmpty($pendingToken);
        $this->assertNotNull(Cache::get("2fa_pending:{$pendingToken}"));
    }

    public function test_admin_without_2fa_gets_token_directly_on_login(): void
    {
        $admin = $this->createAdmin([
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
        ]);

        $this->postJson('/api/auth/login', [
            'email'    => $admin->email,
            'password' => 'AdminPass123!',
        ])
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonMissing(['requires_2fa' => true]);
    }

    public function test_2fa_not_triggered_when_enabled_but_not_confirmed(): void
    {
        $google2fa = new Google2FA();
        $secret    = $google2fa->generateSecretKey();

        $admin = $this->createAdmin([
            'two_factor_secret'       => encrypt($secret),
            'two_factor_enabled'      => true,
            'two_factor_confirmed_at' => null, // pas encore confirmé
        ]);

        $this->postJson('/api/auth/login', [
            'email'    => $admin->email,
            'password' => 'AdminPass123!',
        ])
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonMissing(['requires_2fa' => true]);
    }

    public function test_regular_user_login_never_triggers_2fa(): void
    {
        $user = User::factory()->create([
            'role'      => 'user',
            'is_active' => true,
            'password'  => bcrypt('Password123!'),
        ]);

        $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'Password123!',
        ])
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonMissing(['requires_2fa' => true]);
    }

    // ══════════════════════════════════════════════════════════════════════
    // VERIFY-2FA — POST /api/auth/admin/verify-2fa
    // ══════════════════════════════════════════════════════════════════════

    public function test_verify_2fa_with_valid_pending_token_and_code_returns_token(): void
    {
        [$admin, $secret] = $this->createAdminWith2FA();

        $pendingToken = 'valid_test_pending_token_' . str_repeat('x', 40);
        Cache::put("2fa_pending:{$pendingToken}", $admin->id, now()->addMinutes(10));

        $this->postJson('/api/auth/admin/verify-2fa', [
            'pending_token' => $pendingToken,
            'code'          => $this->validCode($secret),
        ])
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);

        $this->assertNull(Cache::get("2fa_pending:{$pendingToken}"));
    }

    public function test_verify_2fa_with_expired_pending_token_returns_401(): void
    {
        $this->postJson('/api/auth/admin/verify-2fa', [
            'pending_token' => 'nonexistent_or_expired_token_' . str_repeat('y', 36),
            'code'          => '123456',
        ])
            ->assertStatus(401)
            ->assertJsonFragment(['message' => 'Session expirée. Veuillez vous reconnecter.']);
    }

    public function test_verify_2fa_with_invalid_code_returns_422(): void
    {
        [$admin] = $this->createAdminWith2FA();

        $pendingToken = 'test_pending_token_invalid_code_' . str_repeat('z', 32);
        Cache::put("2fa_pending:{$pendingToken}", $admin->id, now()->addMinutes(10));

        $this->postJson('/api/auth/admin/verify-2fa', [
            'pending_token' => $pendingToken,
            'code'          => '000000',
        ])
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Code invalide. Vérifiez votre application d\'authentification.']);
    }

    public function test_verify_2fa_requires_both_fields(): void
    {
        $this->postJson('/api/auth/admin/verify-2fa', [])
            ->assertStatus(422);
    }

    public function test_verify_2fa_removes_pending_token_from_cache_after_success(): void
    {
        [$admin, $secret] = $this->createAdminWith2FA();

        $pendingToken = 'cleanup_test_token_' . str_repeat('a', 45);
        Cache::put("2fa_pending:{$pendingToken}", $admin->id, now()->addMinutes(10));

        $this->postJson('/api/auth/admin/verify-2fa', [
            'pending_token' => $pendingToken,
            'code'          => $this->validCode($secret),
        ])->assertStatus(200);

        $this->assertNull(Cache::get("2fa_pending:{$pendingToken}"));
    }

    // ══════════════════════════════════════════════════════════════════════
    // DISABLE — DELETE /api/auth/admin/disable-2fa
    // ══════════════════════════════════════════════════════════════════════

    public function test_admin_can_disable_2fa_with_valid_code(): void
    {
        [$admin, $secret] = $this->createAdminWith2FA();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->deleteJson('/api/auth/admin/disable-2fa', [
                'code' => $this->validCode($secret),
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Authentification à deux facteurs désactivée.']);

        $admin->refresh();
        $this->assertFalse((bool) $admin->two_factor_enabled);
        $this->assertNull($admin->two_factor_secret);
        $this->assertNull($admin->two_factor_confirmed_at);
    }

    public function test_disable_2fa_fails_with_invalid_code(): void
    {
        [$admin] = $this->createAdminWith2FA();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->deleteJson('/api/auth/admin/disable-2fa', ['code' => '000000'])
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Code invalide.']);

        $admin->refresh();
        $this->assertTrue($admin->two_factor_enabled);
    }

    public function test_disable_2fa_fails_when_2fa_not_enabled(): void
    {
        $admin = $this->createAdmin([
            'two_factor_enabled'      => false,
            'two_factor_secret'       => null,
            'two_factor_confirmed_at' => null,
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken($admin))
            ->deleteJson('/api/auth/admin/disable-2fa', ['code' => '123456'])
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'La 2FA n\'est pas activée sur ce compte.']);
    }

    public function test_non_admin_cannot_disable_2fa(): void
    {
        $user  = User::factory()->create(['role' => 'user', 'is_active' => true]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/auth/admin/disable-2fa', ['code' => '123456'])
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_disable_2fa(): void
    {
        $this->deleteJson('/api/auth/admin/disable-2fa', ['code' => '123456'])
            ->assertStatus(401);
    }

    // ══════════════════════════════════════════════════════════════════════
    // FLUX COMPLET — setup → confirm → login → verify
    // ══════════════════════════════════════════════════════════════════════

    public function test_complete_2fa_flow(): void
    {
        $google2fa = new Google2FA();
        $admin     = $this->createAdmin();
        $token     = $this->adminToken($admin);

        // 1. Setup : récupération du QR code et de la clé secrète
        $setupResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/admin/setup-2fa')
            ->assertStatus(200);

        $secret = $setupResponse->json('secret_key');
        $this->assertNotEmpty($secret);

        // 2. Confirmation avec un code TOTP valide
        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/admin/confirm-2fa', [
                'code' => $google2fa->getCurrentOtp($secret),
            ])
            ->assertStatus(200);

        $admin->refresh();
        $this->assertTrue($admin->two_factor_enabled);
        $this->assertNotNull($admin->two_factor_confirmed_at);

        // 3. Login → doit retourner requires_2fa
        $loginResponse = $this->postJson('/api/auth/login', [
            'email'    => $admin->email,
            'password' => 'AdminPass123!',
        ])->assertStatus(200);

        $this->assertTrue($loginResponse->json('requires_2fa'));
        $pendingToken = $loginResponse->json('pending_token');

        // 4. Vérification avec code TOTP → retourne le token final
        $this->postJson('/api/auth/admin/verify-2fa', [
            'pending_token' => $pendingToken,
            'code'          => $google2fa->getCurrentOtp($secret),
        ])
            ->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }
}
