<?php

namespace Tests\Integration;

use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupportMessageIntegrationTest extends TestCase
{
    use RefreshDatabase;

    // ── Persistance ───────────────────────────────────────────────────────

    public function test_message_is_persisted_to_database(): void
    {
        $user = User::factory()->create();

        SupportMessage::factory()->create([
            'user_id'      => $user->id,
            'email'        => 'contact@cyna.fr',
            'message_body' => 'Mon produit ne fonctionne plus.',
            'status'       => 'new',
        ]);

        $this->assertDatabaseHas('support_messages', [
            'email'        => 'contact@cyna.fr',
            'message_body' => 'Mon produit ne fonctionne plus.',
        ]);
    }

    // ── Relation user ─────────────────────────────────────────────────────

    public function test_message_belongs_to_user(): void
    {
        $user    = User::factory()->create(['email' => 'user@cyna.fr']);
        $message = SupportMessage::factory()->create(['user_id' => $user->id]);

        $this->assertSame('user@cyna.fr', $message->user->email);
    }

    public function test_message_user_is_nullable(): void
    {
        $message = SupportMessage::factory()->create(['user_id' => null]);

        $this->assertNull($message->user_id);
        $this->assertNull($message->user);
    }

    public function test_deleting_user_sets_message_user_id_to_null(): void
    {
        $user    = User::factory()->create();
        $message = SupportMessage::factory()->create(['user_id' => $user->id]);

        $user->delete();

        $fresh = SupportMessage::find($message->id);
        $this->assertNull($fresh->user_id);
    }

    // ── Types ─────────────────────────────────────────────────────────────

    public function test_form_type_is_persisted(): void
    {
        $msg = SupportMessage::factory()->create(['type' => 'form']);
        $this->assertSame('form', SupportMessage::find($msg->id)->type);
    }

    public function test_chatbot_type_is_persisted(): void
    {
        $msg = SupportMessage::factory()->create(['type' => 'chatbot']);
        $this->assertSame('chatbot', SupportMessage::find($msg->id)->type);
    }

    // ── Statuts ───────────────────────────────────────────────────────────

    public function test_status_can_be_updated_to_in_progress(): void
    {
        $msg = SupportMessage::factory()->create(['status' => 'new']);

        $msg->update(['status' => 'in_progress']);

        $this->assertDatabaseHas('support_messages', [
            'id'     => $msg->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_status_can_be_updated_to_resolved(): void
    {
        $msg = SupportMessage::factory()->create(['status' => 'in_progress']);

        $msg->update(['status' => 'resolved']);

        $this->assertDatabaseHas('support_messages', [
            'id'     => $msg->id,
            'status' => 'resolved',
        ]);
    }

    // ── requires_human ────────────────────────────────────────────────────

    public function test_requires_human_can_be_set_to_true(): void
    {
        $msg = SupportMessage::factory()->create(['requires_human' => true]);

        $this->assertTrue(SupportMessage::find($msg->id)->requires_human);
    }

    public function test_requires_human_defaults_to_false(): void
    {
        $msg = SupportMessage::factory()->create();

        $this->assertFalse(SupportMessage::find($msg->id)->requires_human);
    }
}
