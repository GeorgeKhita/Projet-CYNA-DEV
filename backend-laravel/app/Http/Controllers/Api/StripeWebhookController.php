<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                $secret
            );
        } catch (SignatureVerificationException $e) {
            return response('Signature invalide.', 400);
        }

        match ($event->type) {
            'invoice.payment_failed'       => $this->onPaymentFailed($event->data->object),
            'invoice.payment_succeeded'    => $this->onPaymentSucceeded($event->data->object),
            'customer.subscription.deleted'=> $this->onSubscriptionDeleted($event->data->object),
            default                        => null,
        };

        return response('OK', 200);
    }

    private function onPaymentFailed(object $invoice): void
    {
        if (!$invoice->subscription) return;

        Subscription::where('stripe_sub_id', $invoice->subscription)
            ->update(['status' => 'past_due']);
    }

    private function onPaymentSucceeded(object $invoice): void
    {
        if (!$invoice->subscription) return;

        Subscription::where('stripe_sub_id', $invoice->subscription)
            ->update([
                'status'               => 'active',
                'current_period_start' => now()->toDateString(),
                'current_period_end'   => now()->addMonth()->toDateString(),
            ]);
    }

    private function onSubscriptionDeleted(object $stripeSub): void
    {
        Subscription::where('stripe_sub_id', $stripeSub->id)
            ->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);
    }
}
