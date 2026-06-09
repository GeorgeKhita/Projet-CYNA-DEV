<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class PaymentController extends Controller
{
    public function createIntent(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.5',
        ]);

        $stripe = new StripeClient(config('services.stripe.secret'));

        $intent = $stripe->paymentIntents->create([
            'amount'   => (int) round($data['amount'] * 100),
            'currency' => 'eur',
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return response()->json(['client_secret' => $intent->client_secret]);
    }
}
