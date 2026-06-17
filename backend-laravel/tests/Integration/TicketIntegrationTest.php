<?php

namespace Tests\Integration;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_ticket_is_persisted_to_database(): void
    {
        $user   = User::factory()->create();
        $ticket = Ticket::create([
            'user_id'  => $user->id,
            'subject'  => 'Problème de connexion',
            'status'   => 'open',
            'priority' => 'high',
        ]);

        $this->assertDatabaseHas('tickets', [
            'id'      => $ticket->id,
            'subject' => 'Problème de connexion',
            'status'  => 'open',
            'priority'=> 'high',
        ]);
    }

    public function test_ticket_belongs_to_user(): void
    {
        $user   = User::factory()->create(['email' => 'client@cyna.fr']);
        $ticket = Ticket::create(['user_id' => $user->id, 'subject' => 'Test', 'status' => 'open', 'priority' => 'normal']);

        $this->assertSame('client@cyna.fr', $ticket->user->email);
    }

    public function test_ticket_has_many_messages(): void
    {
        $user   = User::factory()->create();
        $ticket = Ticket::create(['user_id' => $user->id, 'subject' => 'Test', 'status' => 'open', 'priority' => 'normal']);

        $ticket->messages()->create(['user_id' => $user->id, 'message' => 'Premier message']);
        $ticket->messages()->create(['user_id' => $user->id, 'message' => 'Second message']);

        $this->assertCount(2, $ticket->fresh()->messages);
    }

    public function test_message_belongs_to_ticket(): void
    {
        $user   = User::factory()->create();
        $ticket = Ticket::create(['user_id' => $user->id, 'subject' => 'Test', 'status' => 'open', 'priority' => 'normal']);
        $msg    = TicketMessage::create(['ticket_id' => $ticket->id, 'user_id' => $user->id, 'message' => 'Coucou']);

        $this->assertSame($ticket->id, $msg->ticket->id);
    }

    public function test_deleting_ticket_cascades_to_messages(): void
    {
        $user   = User::factory()->create();
        $ticket = Ticket::create(['user_id' => $user->id, 'subject' => 'Test', 'status' => 'open', 'priority' => 'normal']);
        $ticket->messages()->create(['user_id' => $user->id, 'message' => 'À supprimer']);

        $ticket->delete();

        $this->assertDatabaseCount('ticket_messages', 0);
    }

    public function test_deleting_user_cascades_to_tickets(): void
    {
        $user   = User::factory()->create();
        Ticket::create(['user_id' => $user->id, 'subject' => 'Test', 'status' => 'open', 'priority' => 'normal']);

        $user->delete();

        $this->assertDatabaseCount('tickets', 0);
    }
}
