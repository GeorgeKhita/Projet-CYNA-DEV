<?php

namespace Tests\Unit\Models;

use App\Models\SecurityLog;
use App\Models\User;
use Tests\TestCase;

class SecurityLogTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new SecurityLog())->getFillable();

        foreach (['user_id', 'event_type', 'resource_name', 'resource_id', 'old_values', 'new_values', 'ip_address'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_old_values_is_cast_to_array(): void
    {
        $log = new SecurityLog(['old_values' => ['name' => 'Ancien']]);
        $this->assertIsArray($log->old_values);
        $this->assertSame('Ancien', $log->old_values['name']);
    }

    public function test_new_values_is_cast_to_array(): void
    {
        $log = new SecurityLog(['new_values' => ['name' => 'Nouveau']]);
        $this->assertIsArray($log->new_values);
        $this->assertSame('Nouveau', $log->new_values['name']);
    }

    public function test_event_type_can_be_set(): void
    {
        $log = new SecurityLog(['event_type' => 'login_failed']);
        $this->assertSame('login_failed', $log->event_type);
    }

    public function test_user_relation_is_belongs_to(): void
    {
        $this->assertSame(User::class, get_class((new SecurityLog())->user()->getRelated()));
    }
}
