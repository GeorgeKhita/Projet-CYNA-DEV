<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    private function auth(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test')->plainTextToken);
    }

    public function test_unauthenticated_cannot_list_tickets(): void
    {
        $this->getJson('/api/tickets')->assertStatus(401);
    }

    public function test_user_can_create_ticket_with_first_message(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->auth($user)->postJson('/api/tickets', [
            'subject'  => 'Mon SOC ne démarre plus',
            'message'  => 'Bonjour, depuis ce matin...',
            'priority' => 'high',
        ])->assertStatus(201)
          ->assertJsonPath('subject', 'Mon SOC ne démarre plus')
          ->assertJsonPath('status', 'open');

        $this->assertDatabaseHas('tickets', ['user_id' => $user->id, 'subject' => 'Mon SOC ne démarre plus']);
        $this->assertDatabaseHas('ticket_messages', ['message' => 'Bonjour, depuis ce matin...']);
    }

    public function test_creating_ticket_requires_subject_and_message(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->auth($user)->postJson('/api/tickets', ['subject' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['subject', 'message']);
    }

    public function test_user_can_list_own_tickets(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        Ticket::create(['user_id' => $user->id, 'subject' => 'A', 'status' => 'open', 'priority' => 'normal']);

        $this->auth($user)->getJson('/api/tickets')
            ->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_user_cannot_view_another_users_ticket(): void
    {
        $owner   = User::factory()->create(['is_active' => true]);
        $other   = User::factory()->create(['is_active' => true]);
        $ticket  = Ticket::create(['user_id' => $owner->id, 'subject' => 'Privé', 'status' => 'open', 'priority' => 'normal']);

        $this->auth($other)->getJson("/api/tickets/{$ticket->id}")->assertStatus(404);
    }

    public function test_user_can_add_message_to_open_ticket(): void
    {
        $user   = User::factory()->create(['is_active' => true]);
        $ticket = Ticket::create(['user_id' => $user->id, 'subject' => 'A', 'status' => 'open', 'priority' => 'normal']);

        $this->auth($user)->postJson("/api/tickets/{$ticket->id}/messages", ['message' => 'Une précision'])
            ->assertStatus(201);

        $this->assertDatabaseHas('ticket_messages', ['ticket_id' => $ticket->id, 'message' => 'Une précision']);
    }

    public function test_cannot_add_message_to_closed_ticket(): void
    {
        $user   = User::factory()->create(['is_active' => true]);
        $ticket = Ticket::create(['user_id' => $user->id, 'subject' => 'A', 'status' => 'closed', 'priority' => 'normal']);

        $this->auth($user)->postJson("/api/tickets/{$ticket->id}/messages", ['message' => 'Trop tard'])
            ->assertStatus(422);
    }
}
