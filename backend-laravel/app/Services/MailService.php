<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailService
{
    public static function send(
        string $toEmail,
        string $subject,
        string $html,
        string $toName = '',
        ?string $replyTo = null,
        ?array $attachment = null
    ): bool {
        $payload = [
            'from'    => [
                'email' => env('MAIL_FROM_ADDRESS', 'hello@demomailtrap.com'),
                'name'  => env('MAIL_FROM_NAME', 'CYNA'),
            ],
            'to'      => [['email' => $toEmail, 'name' => $toName ?: $toEmail]],
            'subject' => $subject,
            'html'    => $html,
        ];

        if ($replyTo) {
            $payload['reply_to'] = [['email' => $replyTo]];
        }

        if ($attachment) {
            $payload['attachments'] = [$attachment];
        }

        try {
            $response = Http::withToken(env('MAILTRAP_API_KEY'))
                ->post('https://send.api.mailtrap.io/api/send', $payload);

            if (!$response->successful()) {
                Log::error('Mailtrap API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Mailtrap send failed: ' . $e->getMessage());
            return false;
        }
    }
}
