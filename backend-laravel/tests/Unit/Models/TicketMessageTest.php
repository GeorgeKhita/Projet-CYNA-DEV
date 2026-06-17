<?php

namespace Tests\Unit\Models;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Tests\TestCase;

class TicketMessageTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new TicketMessage())->getFillable();

        foreach (['ticket_id', 'user_id', 'message'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_message_can_be_set(): void
    {
        $msg = new TicketMessage(['message' => 'Bonjour, j\'ai un souci.']);
        $this->assertSame('Bonjour, j\'ai un souci.', $msg->message);
    }

    public function test_ticket_relation_is_belongs_to(): void
    {
        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\BelongsTo::class,
            (new TicketMessage())->ticket()
        );
        $this->assertSame(Ticket::class, get_class((new TicketMessage())->ticket()->getRelated()));
    }

    public function test_user_relation_is_belongs_to(): void
    {
        $this->assertInstanceOf(
            \Illuminate\Database\Eloquent\Relations\BelongsTo::class,
            (new TicketMessage())->user()
        );
        $this->assertSame(User::class, get_class((new TicketMessage())->user()->getRelated()));
    }
}
