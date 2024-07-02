<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        // Log the webhook payload for debugging
        Log::info('Webhook received: ', $request->all());

        // Process the webhook data as needed
        // ...

        return response()->json(['status' => 'success'], 200);
    }
}
