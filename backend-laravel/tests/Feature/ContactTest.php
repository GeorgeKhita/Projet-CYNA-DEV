<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_visitor_can_send_contact_message(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', [
            'email'   => 'visiteur@exemple.fr',
            'subject' => 'Demande de démo',
            'message' => 'Bonjour, je souhaite une démo.',
        ])->assertStatus(200)
          ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('support_messages', [
            'email'        => 'visiteur@exemple.fr',
            'subject'      => 'Demande de démo',
            'message_body' => 'Bonjour, je souhaite une démo.',
            'type'         => 'form',
            'user_id'      => null,
        ]);
    }

    public function test_authenticated_user_can_also_send_a_contact_message(): void
    {
        // /api/contact est une route publique : le message est créé même
        // pour un utilisateur connecté (l'endpoint n'exige pas d'authentification).
        Mail::fake();
        $user = User::factory()->create(['is_active' => true]);

        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('t')->plainTextToken)
            ->postJson('/api/contact', [
                'email'   => $user->email,
                'subject' => 'Question facturation',
                'message' => 'Une question.',
            ])->assertStatus(200);

        $this->assertDatabaseHas('support_messages', [
            'subject'      => 'Question facturation',
            'message_body' => 'Une question.',
            'type'         => 'form',
        ]);
    }

    public function test_contact_validation_fails_with_missing_fields(): void
    {
        Mail::fake();

        $this->postJson('/api/contact', ['email' => 'pas-un-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'subject', 'message']);
    }
}
