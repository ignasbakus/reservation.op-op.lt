<?php

namespace App\MontonioPayments;

use App\Models\MontonioPaymentCreationLog;
use Firebase\JWT\JWT;
use GuzzleHttp\Client;

class MontonioPaymentsService
{
    public function createPaymentLink($orderId)
    {
        $accessKey = config('montonio.access_key');
        $secretKey = config('montonio.secret_key');
        $apiUrl = config('montonio.api_url');

        $payload = [
            "accessKey" => $accessKey,
            "description" => "MY-ORDER-ID-123",
            "currency" => "EUR",
            "amount" => 99.99,
            "locale" => "lt",
            "expiresAt" => "2024-07-02T18:00:00.000Z",
            "askAdditionalInfo" => true,
            "notificationUrl" => 'https://715d-78-60-128-20.ngrok-free.app/webhook/initiated',
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
        MontonioPaymentCreationLog::create([
            'order_id' => $orderId,
            'payment_creation_response' => $bodyEncoded,
            'payload' => json_encode($payload)
        ]);
        if ($statusCode >= 400) {
            return response()->json(['error' => $body['message']], $statusCode);
        }

        return $body;
    }

    public function retrievePaymentLink($orderId)
    {
        // Query the database for the payment link with the specified orderId
        $logEntry = MontonioPaymentCreationLog::where('order_id', $orderId)->first();

        if ($logEntry) {
            // Decode the payment creation response to get the URL
            $paymentCreationResponse = json_decode($logEntry->payment_creation_response, true);
            return $paymentCreationResponse['url'] ?? null;
        }

        return null;
    }
}
