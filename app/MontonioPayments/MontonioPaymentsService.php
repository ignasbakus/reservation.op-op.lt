<?php

namespace App\MontonioPayments;

use App\Mail\admin\adminOrderUpdated;
use App\Mail\user\orderUpdated;
use App\Models\MontonioPaymentCreationLog;
use App\Models\MontonioPaymentWebhooksLog;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Trampoline;
use App\Trampolines\TrampolineOrder;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
        $returnUrl = config('montonio.return_url');
        $notificationUrl = config('montonio.webhook_url');
        $order = Order::find($orderId);
        $client = \App\Models\Client::find($order->client_id);

        $grandTotal = number_format((float)$order->advance_sum, 2, '.', '');
        $payload = [
            'accessKey' => $accessKey,
            'merchantReference' => $order->order_number,
            'returnUrl' => $returnUrl . $order->order_number,
            'notificationUrl' => $notificationUrl,
            'currency' => 'EUR',
            'grandTotal' => (float)$grandTotal,
            'locale' => 'lt',
            'expiresIn' => 5,
            'billingAddress' => [
                'firstName' => $client->name,
                'lastName' => $client->surname,
                'email' => $client->email,
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

    public function retrievePaymentLink($orderId, $fromHtml = null)
    {
        // Query the database for the payment link with the specified orderId
        $logEntry = MontonioPaymentCreationLog::where('order_id', $orderId)->first();
//        dd($logEntry);

        if ($logEntry) {
            // Decode the payment creation response to get the URL
            $paymentCreationResponse = json_decode($logEntry->payment_creation_response, true);
            return $paymentCreationResponse['paymentUrl'] ?? null;
        }
        return null;
    }

    private function retrieveUuidAndOrderId($id)
    {
        return MontonioPaymentCreationLog::where('uuid', $id)->select('uuid', 'order_id')->first();
    }

    private function orderPaid($orderId, $paymentStatus): void
    {
        (new TrampolineOrder())->updateOrderStatus($orderId, $paymentStatus);
    }

    private function orderAbandoned($orderId): void
    {
        (new TrampolineOrder())->cancelOrder($orderId, true);
    }

    public function checkOrderStatus($orderId): JsonResponse
    {
        $uuid = MontonioPaymentCreationLog::where('order_id', $orderId)->first()->uuid;
        $apiUrl = config('montonio.api_url') . 'orders/' . $uuid;
        $accessKey = config('montonio.access_key');

        $payload = [
            'accessKey' => $accessKey,
            'exp' => time() + (60 * 60)
        ];

        $Token = JWT::encode(
            $payload,
            config('montonio.secret_key'),
            'HS256'
        );

        $client = new Client();
        $response = $client->get($apiUrl, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $Token,
            ],
            'json' => [],
        ]);
        $paymentStatus = json_decode($response->getBody(), true)['paymentStatus'] ?? 'UNKNOWN';

        switch ($paymentStatus) {
            case 'PAID':
                if ((new TrampolineOrder())->getOrderStatus($orderId)['orderStatus'] != 'Apmokėtas' &&
                    (new TrampolineOrder())->getOrderStatus($orderId)['orderStatus'] != 'Atšauktas kliento'){
                        $activity = ((new TrampolineOrder())->updateOrderActivity($orderId, $paymentStatus));
                        if (!$activity['status']){
                            return response()->json([
                                'status' => false,
                                'message' => 'Užsakymo būsena negali būti pakeista į apmokėta, nes datos jau užimtos kito kliento.
                                Pakeiskite datas!',
                            ]);
                        }
                        (new TrampolineOrder())->updateOrderStatus($orderId, $paymentStatus);
                        return response()->json([
                            'status' => 'changed',
                            'message' => 'Užsakymas buvo pakeistas į apmokėtą',
                        ]);
                }
                break;
            case 'ABANDONED':
                if ((new TrampolineOrder())->getOrderStatus($orderId)['orderStatus'] != 'Atšauktas, nes neapmokėtas') {
                    ((new TrampolineOrder())->updateOrderActivity($orderId, $paymentStatus));
                    (new TrampolineOrder())->updateOrderStatus($orderId, $paymentStatus);
                    return response()->json([
                        'status' => 'changed',
                        'message' => 'Užsakymas buvo pakeistas į atšauktą, nes neapmokėtas',
                    ]);
                }
                break;
        }
        return response()->json([
            'status' => 'unchanged',
            'message' => 'Nebuvo atlikta jokių pakeitimų, užsakymo būsena teisinga',
        ]);
    }

    public function handlePaymentResponse(): JsonResponse
    {
        Log::info('patekom i handle payment response');
        JWT::$leeway = 60 * 5;
        $decoded = JWT::decode(
            json_decode(\request()->getContent(), true)['orderToken'],
            new Key(config('montonio.secret_key'), 'HS256'),
        );

        $retrieveUuidAndOrderId = self::retrieveUuidAndOrderId($decoded->uuid);
        MontonioPaymentWebhooksLog::create([
            'order_id' => $retrieveUuidAndOrderId->order_id,
            'callback_response' => json_encode($decoded),
        ]);

        if (
            $decoded->uuid === $retrieveUuidAndOrderId->uuid &&
            $decoded->accessKey === config('montonio.access_key')
        )
            switch ($decoded->paymentStatus) {
                case 'PAID':
                    self::orderPaid($retrieveUuidAndOrderId->order_id, $decoded->paymentStatus);
                    break;
                case 'ABANDONED':
                    self::orderAbandoned($retrieveUuidAndOrderId->order_id);
                    break;
                default:
                    break;
            }
        return response()->json([
            'status' => 'success',
            'message' => 'Received webhook : ' . $decoded->paymentStatus,
        ], 200);
    }
}
