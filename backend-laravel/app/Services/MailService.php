<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailService
{
    /**
     * Envoi d'un email via l'API HTTP de Brevo (port 443).
     * Fonctionne en local ET sur Railway (contrairement au SMTP, bloqué par Railway).
     */
    public static function send(
        string $toEmail,
        string $subject,
        string $html,
        string $toName = '',
        ?string $replyTo = null,
        ?array $attachment = null
    ): bool {
        $payload = [
            'sender'      => [
                'email' => env('MAIL_FROM_ADDRESS', 'contact.cyna.app@gmail.com'),
                'name'  => env('MAIL_FROM_NAME', 'CYNA'),
            ],
            'to'          => [['email' => $toEmail, 'name' => $toName ?: $toEmail]],
            'subject'     => $subject,
            'htmlContent' => $html,
        ];

        if ($replyTo) {
            $payload['replyTo'] = ['email' => $replyTo];
        }

        if ($attachment) {
            // Brevo attend { content: <base64>, name: <filename> }
            $payload['attachment'] = [[
                'content' => $attachment['content'] ?? '',
                'name'    => $attachment['filename'] ?? $attachment['name'] ?? 'fichier',
            ]];
        }

        try {
            $response = Http::withHeaders([
                'api-key'      => env('BREVO_API_KEY'),
                'accept'       => 'application/json',
                'content-type' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', $payload);

            if (!$response->successful()) {
                Log::error('Brevo API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Brevo send failed: ' . $e->getMessage());
            return false;
        }
    }
}
