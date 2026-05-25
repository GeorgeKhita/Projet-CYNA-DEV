<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'name'    => 'nullable|string|max:255',
        ]);

        // Log the contact request
        Log::info('Contact form submission', [
            'email'   => $validated['email'],
            'subject' => $validated['subject'],
        ]);

        // In production, you would send an actual email here.
        // For demo purposes, we just log and return success.
        // Example:
        // Mail::raw($validated['message'], function ($msg) use ($validated) {
        //     $msg->to('support@cyna-it.fr')
        //         ->from($validated['email'], $validated['name'] ?? $validated['email'])
        //         ->subject('[Contact] ' . $validated['subject']);
        // });

        return response()->json([
            'message' => 'Votre message a bien été envoyé. Notre équipe vous répondra dans les meilleurs délais.',
        ], 200);
    }
}
