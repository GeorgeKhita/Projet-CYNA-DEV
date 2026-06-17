<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTicketTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin', 'is_active' => true]);
    }

    private function auth(User $user): static
    {
        return $this->withHeader('Authorization', 'Bearer ' . $user->createToken('test')->plainTextToken);
    }

    private function makeTicket(): Ticket
    {
        $client = User::factory()->create(['is_active' => true]);
        return Ticket::create(['user_id' => $client->id, 'subject' => 'Souci', 'status' => 'open', 'priority' => 'normal']);
    }

    public function test_admin_can_list_all_tickets(): void
    {
        $this->makeTicket();
        $this->auth($this->admin())->getJson('/api/admin/tickets')
            ->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_non_admin_cannot_list_tickets(): void
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);
        $this->auth($user)->getJson('/api/admin/tickets')->assertStatus(403);
    }

    public function test_admin_can_view_ticket(): void
    {
        $ticket = $this->makeTicket();
        $this->auth($this->admin())->getJson("/api/admin/tickets/{$ticket->id}")
            ->assertStatus(200)
            ->assertJsonPath('subject', 'Souci');
    }

    public function test_admin_can_update_ticket_status(): void
    {
        $ticket = $this->makeTicket();
        $this->auth($this->admin())->patchJson("/api/admin/tickets/{$ticket->id}/status", ['status' => 'resolved'])
            ->assertStatus(200);

        $this->assertDatabaseHas('tickets', ['id' => $ticket->id, 'status' => 'resolved']);
    }

    public function test_admin_reply_creates_message_and_moves_to_in_progress(): void
    {
        $ticket = $this->makeTicket();
        $this->auth($this->admin())->postJson("/api/admin/tickets/{$ticket->id}/reply", ['message' => 'Nous regardons.'])
            ->assertStatus(201);

        $this->assertDatabaseHas('ticket_messages', ['ticket_id' => $ticket->id, 'message' => 'Nous regardons.']);
        $this->assertDatabaseHas('tickets', ['id' => $ticket->id, 'status' => 'in_progress']);
    }
}
