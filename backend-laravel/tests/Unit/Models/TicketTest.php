<?php

namespace Tests\Unit\Models;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Tests\TestCase;

class TicketTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new Ticket())->getFillable();

        foreach (['user_id', 'subject', 'status', 'priority'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_status_can_be_set(): void
    {
        $ticket = new Ticket(['status' => 'in_progress']);
        $this->assertSame('in_progress', $ticket->status);
    }

    public function test_priority_can_be_set(): void
    {
        $ticket = new Ticket(['priority' => 'urgent']);
        $this->assertSame('urgent', $ticket->priority);
    }

    public function test_user_relation_is_belongs_to(): void
    {
        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\BelongsTo::class,
            (new Ticket())->user()
        );
        $this->assertSame(User::class, get_class((new Ticket())->user()->getRelated()));
    }

    public function test_messages_relation_is_has_many(): void
    {
        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\HasMany::class,
            (new Ticket())->messages()
        );
        $this->assertSame(TicketMessage::class, get_class((new Ticket())->messages()->getRelated()));
    }
}
