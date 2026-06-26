<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\MailService;

class ContactController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ], [
            'email.required'   => 'L\'email est obligatoire.',
            'subject.required' => 'Le sujet est obligatoire.',
            'message.required' => 'Le message est obligatoire.',
        ]);

        SupportMessage::create([
            'user_id'      => $request->user()?->id,
            'type'         => 'form',
            'email'        => $validated['email'],
            'subject'      => $validated['subject'],
            'message_body' => $validated['message'],
            'status'       => 'new',
        ]);

        MailService::send(
            'support@cyna-it.fr',
            '[Contact] ' . $validated['subject'],
            "<p><strong>De :</strong> {$validated['email']}</p>"
            . "<p><strong>Sujet :</strong> {$validated['subject']}</p>"
            . "<hr><p>" . nl2br(htmlspecialchars($validated['message'])) . "</p>",
            'Support CYNA',
            $validated['email']
        );

        return response()->json(['message' => 'Votre message a bien été envoyé.']);
    }
}
