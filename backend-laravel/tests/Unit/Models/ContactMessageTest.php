<?php

namespace Tests\Unit\Models;

use App\Models\ContactMessage;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ContactMessageTest extends TestCase
{
    // ── Casts ─────────────────────────────────────────────────────────────

    public function test_is_read_casts_to_boolean_true(): void
    {
        $msg = new ContactMessage(['is_read' => 1]);
        $this->assertIsBool($msg->is_read);
        $this->assertTrue($msg->is_read);
    }

    public function test_is_read_casts_to_boolean_false(): void
    {
        $msg = new ContactMessage(['is_read' => 0]);
        $this->assertIsBool($msg->is_read);
        $this->assertFalse($msg->is_read);
    }

    public function test_read_at_casts_to_carbon(): void
    {
        $msg = new ContactMessage(['read_at' => '2024-06-01 10:00:00']);
        $this->assertInstanceOf(Carbon::class, $msg->read_at);
    }

    public function test_read_at_is_null_when_unread(): void
    {
        $msg = new ContactMessage(['read_at' => null]);
        $this->assertNull($msg->read_at);
    }

    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new ContactMessage())->getFillable();

        foreach (['name', 'email', 'subject', 'message', 'is_read', 'read_at'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_message_can_be_stored(): void
    {
        $msg = new ContactMessage(['message' => 'Bonjour, je souhaite un devis.']);
        $this->assertSame('Bonjour, je souhaite un devis.', $msg->message);
    }

    public function test_email_can_be_stored(): void
    {
        $msg = new ContactMessage(['email' => 'contact@entreprise.fr']);
        $this->assertSame('contact@entreprise.fr', $msg->email);
    }
}
