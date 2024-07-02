<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handleInitiated(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::info('Payment Link Created:', $request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Payment link created successfully.'
        ], 200);
    }

    public function handleOpened(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::info('Payment Link Opened:', $request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Payment link opened successfully.'
        ], 200);
    }

    public function handleProcessing(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::info('Payment Processing:', $request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Payment processing.'
        ], 200);
    }

    public function handleCompleted(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::info('Payment Completed:', $request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Payment completed successfully.'
        ], 200);
    }

    public function handleCanceled(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::info('Payment Link Canceled:', $request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Payment link canceled.'
        ], 200);
    }

    public function handleExpired(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::info('Payment Link Expired:', $request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Payment link expired.'
        ], 200);
    }
}
