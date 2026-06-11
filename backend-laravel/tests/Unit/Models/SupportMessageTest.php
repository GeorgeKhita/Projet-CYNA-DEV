<?php

namespace Tests\Unit\Models;

use App\Models\SupportMessage;
use Tests\TestCase;

class SupportMessageTest extends TestCase
{
    // ── Cast booléen ──────────────────────────────────────────────────────

    public function test_requires_human_casts_to_boolean_true(): void
    {
        $msg = new SupportMessage(['requires_human' => 1]);
        $this->assertIsBool($msg->requires_human);
        $this->assertTrue($msg->requires_human);
    }

    public function test_requires_human_casts_to_boolean_false(): void
    {
        $msg = new SupportMessage(['requires_human' => 0]);
        $this->assertIsBool($msg->requires_human);
        $this->assertFalse($msg->requires_human);
    }

    // ── $fillable ─────────────────────────────────────────────────────────

    public function test_fillable_contains_required_fields(): void
    {
        $fillable = (new SupportMessage())->getFillable();

        foreach (['user_id', 'type', 'email', 'subject', 'message_body', 'requires_human', 'status'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    // ── Attributs ─────────────────────────────────────────────────────────

    public function test_type_chatbot_can_be_set(): void
    {
        $msg = new SupportMessage(['type' => 'chatbot']);
        $this->assertSame('chatbot', $msg->type);
    }

    public function test_type_contact_can_be_set(): void
    {
        $msg = new SupportMessage(['type' => 'contact']);
        $this->assertSame('contact', $msg->type);
    }

    public function test_status_open_can_be_set(): void
    {
        $msg = new SupportMessage(['status' => 'open']);
        $this->assertSame('open', $msg->status);
    }

    public function test_status_resolved_can_be_set(): void
    {
        $msg = new SupportMessage(['status' => 'resolved']);
        $this->assertSame('resolved', $msg->status);
    }
}
