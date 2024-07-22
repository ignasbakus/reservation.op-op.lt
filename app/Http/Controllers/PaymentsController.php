<?php

namespace App\Http\Controllers;

use App\Models\MontonioPaymentWebhooksLog;
use App\MontonioPayments\MontonioPaymentsService;
use App\Trampolines\TrampolineOrder;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{
    public function paymentResponse(): JsonResponse
    {
//        Log::info('patekom i payment controller');
        return (new MontonioPaymentsService())->handlePaymentResponse();
    }
    public function checkPaymentStatus(): JsonResponse
    {
        $response =  (new MontonioPaymentsService())->checkOrderStatus(request()->get('OrderId'));
        $data = json_decode($response->getContent(), true);
        return response()->json([
            'status' => $data['status'],
            'message' => $data['message'],
        ]);
    }
}
