<?php

namespace Tests\Unit\Models;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new ActivityLog())->getFillable();

        foreach (['user_id', 'action', 'detail', 'ip_address', 'created_at'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new ActivityLog())->timestamps);
    }

    public function test_created_at_casts_to_carbon(): void
    {
        $log = new ActivityLog(['created_at' => '2024-06-01 12:00:00']);
        $this->assertInstanceOf(Carbon::class, $log->created_at);
    }

    public function test_action_can_be_set(): void
    {
        $log = new ActivityLog(['action' => 'product_created']);
        $this->assertSame('product_created', $log->action);
    }

    public function test_user_relation_is_belongs_to(): void
    {
        $this->assertSame(User::class, get_class((new ActivityLog())->user()->getRelated()));
    }
}
