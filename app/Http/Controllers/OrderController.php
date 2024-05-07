<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function createOrderForm(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        Log::info(json_encode(\request()->all()));
        return view ('orders.public.order');
    }

    public function orderSend(Request $request): JsonResponse
    {
        $formData = $request->only([
            'customerName',
            'customerSurname',
            'customerPhoneNumber',
            'customerEmail',
            'customerDeliveryCity',
            'customerDeliveryPostCode',
            'customerDeliveryAddress'
        ]);

        return response()->json([
            'status' => true,
            'received_params' => $formData
        ]);
    }
}
