<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * POST /api/contact
     * Stocke le message en BDD et envoie un email de notification
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'name'    => 'nullable|string|max:255',
        ]);

        $msg = ContactMessage::create($validated);

        // Notification email à l'équipe support (loggé si MAIL_MAILER=log)
        Mail::send([], [], function ($m) use ($validated) {
            $from = $validated['name'] ? "{$validated['name']} <{$validated['email']}>" : $validated['email'];
            $m->to('support@cyna-it.fr', 'Support CYNA')
              ->replyTo($validated['email'], $validated['name'] ?? $validated['email'])
              ->subject('[Contact] ' . $validated['subject'])
              ->html(
                  "<p><strong>De :</strong> {$from}</p>"
                  . "<p><strong>Sujet :</strong> {$validated['subject']}</p>"
                  . "<hr>"
                  . "<p>" . nl2br(htmlspecialchars($validated['message'])) . "</p>"
              );
        });

        return response()->json([
            'message' => 'Votre message a bien été envoyé. Notre équipe vous répondra dans les meilleurs délais.',
            'id'      => $msg->id,
        ], 200);
    }
}
