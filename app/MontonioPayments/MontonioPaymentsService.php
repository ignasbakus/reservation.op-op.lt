<?php

namespace App\MontonioPayments;

use App\Models\MontonioPaymentCreationLog;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Trampoline;
use App\Trampolines\TrampolineOrder;
use Firebase\JWT\JWT;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class MontonioPaymentsService
{
//    public function createPaymentLink($orderId)
//    {
//        $accessKey = config('montonio.access_key');
//        $secretKey = config('montonio.secret_key');
//        $apiUrl = config('montonio.api_url') . 'payment-link';
//
//        $payload = [
//            "accessKey" => $accessKey,
//            "description" => "MY-ORDER-ID-123",
//            "currency" => "EUR",
//            "amount" => 99.99,
//            "locale" => "lt",
//            "expiresAt" => "2024-07-03T18:00:00.000Z",
//            "askAdditionalInfo" => true,
//            "notificationUrl" => 'https://a6bb-85-206-23-106.ngrok-free.app/webhook/montonio',
//        ];
//
//        // Atsiskaitymo budus bus galima keist kai pabaigsim paskyros registracija
//
//        $payload['exp'] = time() + (10 * 60);
//
//        // Generate the token using Firebase's JWT library
//        $token = JWT::encode($payload, $secretKey, 'HS256');
//
//        // Send the token to the API
//        $client = new Client();
//        $response = $client->post($apiUrl, [
//            'headers' => [
//                'Content-Type' => 'application/json',
//            ],
//            'json' => [
//                'data' => $token,
//            ],
//        ]);
//
//        $statusCode = $response->getStatusCode();
//        $body = json_decode($response->getBody(), true);
//        $bodyEncoded = json_encode($body);
//        MontonioPaymentCreationLog::create([
//            'order_id' => $orderId,
//            'payment_creation_response' => $bodyEncoded,
//            'payload' => json_encode($payload),
//            'uuid' => $body['uuid'] ?? null,
//            /* Idet expiration date */
//        ]);
//        if ($statusCode >= 400) {
//            return response()->json(['error' => $body['message']], $statusCode);
//        }
//
//        return $body;
//    }


    public function createOrder($orderId)
    {
        $accessKey = config('montonio.access_key');
        $secretKey = config('montonio.secret_key');
        $apiUrl = config('montonio.api_url') . 'orders';
        $order = Order::find($orderId);
        $client = \App\Models\Client::find($order->client_id);

        $grandTotal = number_format((float)$order->advance_sum, 2, '.', '');
        Log::info('apiUrl ->', [$apiUrl]);

        $payload = [
            'accessKey' => $accessKey,
            'merchantReference' => $order->order_number,
            'returnUrl' => 'http://localhost:8000/orders/public/order/waiting_confirmation/view/' . $order->order_number,
            'notificationUrl' => 'https://1c75-85-206-23-106.ngrok-free.app/webhook/montonio',
            'currency' => 'EUR',
            'grandTotal' => (float)$grandTotal,
            'locale' => 'lt',
            'billingAddress'    => [
                'firstName'    => $client->name,
                'lastName'     => $client->surname,
                'email'        => $client->email,
                'phoneNumber' => $client->phone,
            ],
            'lineItems' => [
                [
                    'name' => 'Avansas už užsakymą Nr. ' . $order->order_number,
                    'quantity' => 1,
                    'finalPrice' => (float)$grandTotal,
                ]
            ]
        ];

//        dd($payload);

        $payload['payment'] = [
            "method" => "paymentInitiation",
            'methodDisplay' => 'Pay with your bank',
            'amount' => (float)$grandTotal, // Use the actual amount from the order
            'currency' => 'EUR',
            "methodOptions" => [
                "preferredCountry" => "LT",
                "preferredLocale" => "lt",
                "paymentDescription" => "Avansas už užsakymą " . $orderId
            ],
        ];

        // Atsiskaitymo budus bus galima keist kai pabaigsim paskyros registracija

        $payload['exp'] = time() + (10 * 60);

        // Generate the token using Firebase's JWT library
        $token = JWT::encode($payload, $secretKey, 'HS256');

        // Send the token to the API
        $client = new Client();
        $response = $client->post($apiUrl, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'data' => $token,
            ],
        ]);

        $statusCode = $response->getStatusCode();
        $body = json_decode($response->getBody(), true);
        $bodyEncoded = json_encode($body);
        Log::info('Decoded body from service ->', (array)$body);
        MontonioPaymentCreationLog::create([
            'order_id' => $orderId,
            'payment_creation_response' => $bodyEncoded,
            'payload' => json_encode($payload),
            'uuid' => $body['uuid'] ?? null,
            /* Idet expiration date */
        ]);
        if ($statusCode >= 400) {
            return response()->json(['error' => $body['message']], $statusCode);
        }
        Log::info('Link: ' . $body['paymentUrl']);
        return $body;
    }

    public function retrievePaymentLink($orderId)
    {
        // Query the database for the payment link with the specified orderId
        $logEntry = MontonioPaymentCreationLog::where('order_id', $orderId)->first();

        if ($logEntry) {
            // Decode the payment creation response to get the URL
            $paymentCreationResponse = json_decode($logEntry->payment_creation_response, true);
            return $paymentCreationResponse['paymentUrl'] ?? null;
        }

        return null;
    }

    public function retrieveUuidAndOrderId($id)
    {
        return MontonioPaymentCreationLog::where('uuid', $id)->select('uuid', 'order_id')->first();
    }

    public function orderPaid($orderId): void
    {
        (new TrampolineOrder())->updateOrderStatus($orderId);
    }

    public function orderAbandoned($orderId): void
    {
        Log::info('Iš webhoooko patekom į MontonioPaymentService');
        (new TrampolineOrder())->cancelOrder($orderId, true);
    }
}
