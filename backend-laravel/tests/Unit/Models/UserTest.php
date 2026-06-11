<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class UserTest extends TestCase
{
    // ── isAdmin() ─────────────────────────────────────────────────────────

    public function test_is_admin_returns_true_for_admin_role(): void
    {
        $user = new User(['role' => 'admin']);
        $this->assertTrue($user->isAdmin());
    }

    public function test_is_admin_returns_false_for_user_role(): void
    {
        $user = new User(['role' => 'user']);
        $this->assertFalse($user->isAdmin());
    }

    public function test_is_admin_returns_false_for_empty_role(): void
    {
        $user = new User([]);
        $this->assertFalse($user->isAdmin());
    }

    // ── getFullNameAttribute() ────────────────────────────────────────────

    public function test_full_name_concatenates_first_and_last_name(): void
    {
        $user = new User(['first_name' => 'Jean', 'last_name' => 'Dupont']);
        $this->assertSame('Jean Dupont', $user->full_name);
    }

    public function test_full_name_handles_single_word_names(): void
    {
        $user = new User(['first_name' => 'Alice', 'last_name' => 'X']);
        $this->assertSame('Alice X', $user->full_name);
    }

    public function test_full_name_includes_space_between_names(): void
    {
        $user = new User(['first_name' => 'Marie', 'last_name' => 'Curie']);
        $this->assertStringContainsString(' ', $user->full_name);
    }

    // ── Casts booléens ────────────────────────────────────────────────────

    public function test_two_factor_enabled_casts_integer_to_boolean(): void
    {
        $user = new User(['two_factor_enabled' => 1]);
        $this->assertIsBool($user->two_factor_enabled);
        $this->assertTrue($user->two_factor_enabled);
    }

    public function test_two_factor_enabled_false_when_zero(): void
    {
        $user = new User(['two_factor_enabled' => 0]);
        $this->assertIsBool($user->two_factor_enabled);
        $this->assertFalse($user->two_factor_enabled);
    }

    public function test_is_active_casts_to_boolean(): void
    {
        $active   = new User(['is_active' => 1]);
        $inactive = new User(['is_active' => 0]);

        $this->assertTrue($active->is_active);
        $this->assertFalse($inactive->is_active);
    }

    public function test_is_email_verified_casts_to_boolean(): void
    {
        $user = new User(['is_email_verified' => 1]);
        $this->assertIsBool($user->is_email_verified);
        $this->assertTrue($user->is_email_verified);
    }

    // ── Cast datetime ─────────────────────────────────────────────────────

    public function test_two_factor_confirmed_at_casts_to_carbon(): void
    {
        $user = new User(['two_factor_confirmed_at' => '2024-06-01 12:00:00']);
        $this->assertInstanceOf(Carbon::class, $user->two_factor_confirmed_at);
    }

    public function test_two_factor_confirmed_at_is_null_when_not_set(): void
    {
        $user = new User(['two_factor_confirmed_at' => null]);
        $this->assertNull($user->two_factor_confirmed_at);
    }

    // ── $hidden ───────────────────────────────────────────────────────────

    public function test_password_is_hidden(): void
    {
        $this->assertContains('password', (new User())->getHidden());
    }

    public function test_two_factor_secret_is_hidden(): void
    {
        $this->assertContains('two_factor_secret', (new User())->getHidden());
    }

    public function test_email_is_not_hidden(): void
    {
        $this->assertNotContains('email', (new User())->getHidden());
    }

    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_core_fields(): void
    {
        $fillable = (new User())->getFillable();

        foreach (['first_name', 'last_name', 'email', 'password', 'role', 'company'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_fillable_contains_2fa_fields(): void
    {
        $fillable = (new User())->getFillable();

        $this->assertContains('two_factor_enabled', $fillable);
        $this->assertContains('two_factor_secret', $fillable);
        $this->assertContains('two_factor_confirmed_at', $fillable);
    }

    public function test_fillable_contains_is_active(): void
    {
        $this->assertContains('is_active', (new User())->getFillable());
    }

    // ── Logique 2FA ───────────────────────────────────────────────────────

    public function test_2fa_considered_active_only_when_enabled_and_confirmed(): void
    {
        $fullyEnabled = new User([
            'two_factor_enabled'      => true,
            'two_factor_confirmed_at' => '2024-01-01 00:00:00',
        ]);

        $enabledNotConfirmed = new User([
            'two_factor_enabled'      => true,
            'two_factor_confirmed_at' => null,
        ]);

        $disabled = new User([
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
        ]);

        $this->assertTrue(
            $fullyEnabled->two_factor_enabled && $fullyEnabled->two_factor_confirmed_at !== null
        );
        $this->assertFalse(
            $enabledNotConfirmed->two_factor_enabled && $enabledNotConfirmed->two_factor_confirmed_at !== null
        );
        $this->assertFalse(
            $disabled->two_factor_enabled && $disabled->two_factor_confirmed_at !== null
        );
    }
}
