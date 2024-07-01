<?php

namespace App\StripePayments;

use Illuminate\Http\JsonResponse;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripePaymentsService
{
    public function createPaymentLink(): JsonResponse
    {
        // Set Stripe API key
        Stripe::setApiKey(config('stripe.secret'));

        try {
            // Create a new checkout session
            $session = Session::create([
                'payment_method_types' => [
                    'card',
                    'sepa_debit',
                    'sofort',
                    'ideal',
                    'bancontact',
                    'giropay'
                ],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'eur',
                            'product_data' => [
                                'name' => 'Custom Product',
                            ],
                            'unit_amount' => 1000,
                        ],
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'payment',
                'success_url' => 'http://localhost:8000/orders/public?trampoline_id%5B%5D=1', // Use Stripe's default success page
                'cancel_url' => 'http://localhost:8000/orders/public?trampoline_id%5B%5D=1', // Adjust the route as needed
            ]);

            return response()->json(['url' => $session->url], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
