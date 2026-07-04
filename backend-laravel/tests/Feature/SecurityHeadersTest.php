<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_present_on_api_responses(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy');
    }

    public function test_hsts_header_is_sent_only_over_https(): void
    {
        // En HTTP (cas des tests / du local), HSTS ne doit pas être envoyé.
        $this->getJson('/api/categories')
            ->assertHeaderMissing('Strict-Transport-Security');

        // Derrière le proxy (X-Forwarded-Proto: https, proxy de confiance),
        // HSTS doit être présent avec un max-age d'un an.
        $this->getJson('/api/categories', ['X-Forwarded-Proto' => 'https'])
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
}
