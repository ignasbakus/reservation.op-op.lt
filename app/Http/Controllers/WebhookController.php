<?php

namespace App\Http\Controllers;

use App\Models\MontonioPaymentWebhooksLog;
use App\MontonioPayments\MontonioPaymentsService;
use App\Trampolines\TrampolineOrder;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function paymentResponse(): JsonResponse
    {
        //$responseData = json_decode(\request()->getContent(), true);
        //$orderToken = json_decode(\request()->getContent(), true)['orderToken'];
        Log::info('Order token ->' . json_decode(\request()->getContent(), true)['orderToken']);
        JWT::$leeway = 60 * 5;
        $decoded = JWT::decode(
            json_decode(\request()->getContent(), true)['orderToken'],
            new Key(config('montonio.secret_key'), 'HS256'),
        );

        $retrieveUuidAndOrderId = (new MontonioPaymentsService())->retrieveUuidAndOrderId($decoded->uuid);
        Log::info('Order id ->' . $retrieveUuidAndOrderId->order_id);
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
                (new MontonioPaymentsService())->orderPaid($retrieveUuidAndOrderId->order_id);
                break;
            case 'ABANDONED':
                Log::info('Užsakymas buvo atšauktas iš webhooko');
                (new MontonioPaymentsService())->orderAbandoned($retrieveUuidAndOrderId->order_id);
                break;
            default:
                Log::info('Payment failed');
                break;
        }
        return response()->json([
            'status' => 'success',
            'message' => 'Received webhook : ' . $decoded->paymentStatus,
        ], 200);
    }
}
