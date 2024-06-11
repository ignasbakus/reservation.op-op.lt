<?php

namespace App\Http\Controllers;

use App\Mail\OrderPlaced;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Trampoline;
use App\Trampolines\BaseTrampoline;
use App\Trampolines\DataTablesProcessing;
use App\Trampolines\OccupationTimeFrames;
use App\Trampolines\TrampolineOrder;
use App\Trampolines\TrampolineOrderData;
use Carbon\Carbon;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


class OrderController extends Controller
{

    public function adminGetDatatable(): JsonResponse
    {
        $Orders = (new DataTablesProcessing())->getPaginatedData(
            new Order(),
            [
                'Trampolines',
                'Client',
                'Address'
            ],
            \request()->get('length', 0),
            \request()->get('start', 0),
            \request()->get('order', [])
        );

        return response()->json([
            'status' => true,
            'DATA' => $Orders->data,
            'draw' => \request()->get('draw'),
            'list' => $Orders->List,
            'recordsTotal' => $Orders->recordsTotal,
            'recordsFiltered' => $Orders->recordsFiltered,
        ]);

    }

    public function adminGetIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        return view('orders.private.admin_order_table');
    }

    public function publicGetIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        return view('orders.public.order', [
            'Availability' => [],
            'Occupied' => [],
            'Trampolines' => (new Trampoline())->newQuery()->whereIn('id', \request()->get('trampoline_id', []))->get(),
            'Dates' => (object)[
                'CalendarInitial' => Carbon::now()->format('Y-m-d')
            ]
        ]);
    }

    public function publicUpdateCalendar(): JsonResponse
    {
        $trampolineIds = \request()->get('trampoline_id', []);
        $targetFromDate = Carbon::parse(\request()->get('target_start_date', null));
        $targetTillDate = Carbon::parse(\request()->get('target_end_date', null));

//        dd($targetFromDate, $targetTillDate);

        $Trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolineIds)->get();

//        $Occupied = (new BaseTrampoline())->getOccupation(
//            $Trampolines,
//            OccupationTimeFrames::MONTH,
//            new Order(),
//            true,
//            $targetFromDate,
//            $targetTillDate
//        );

//        Log::info('FromDate sent to getAvailability', $targetFromDate->toArray());
        if ($targetFromDate < Carbon::now()) {
            $Availability = (new BaseTrampoline())->getAvailability($Trampolines, (new Order()), Carbon::now()->startOfDay(), true);
//            dd($Availability);
            $Occupied = (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                new Order(),
                true,
                Carbon::now()->startOfDay(),
                $targetTillDate
            );
        } else {
            $Availability = (new BaseTrampoline())->getAvailability($Trampolines, (new Order()), $targetFromDate, true);
            $Occupied = (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                new Order(),
                true,
                $targetFromDate,
                $targetTillDate
            );
        }

        foreach ($Trampolines as $trampoline) {
            $trampoline->rental_start = Carbon::parse($Availability[0]->start)->format('Y-m-d');
            $trampoline->rental_end = Carbon::parse($Availability[0]->end)->format('Y-m-d');
        }

//        dd($Trampolines);

        return response()->json([
            'status' => true,
            'Availability' => $Availability,
            'Occupied' => $Occupied,
            'Trampolines' => $Trampolines
        ]);
    }

    public function privateUpdateCalendar(): JsonResponse
    {

        try {
            $orderId = request()->get('order_id');
            $order = (new TrampolineOrder())->read($orderId);
//
            if (!$order instanceof \App\Models\Order) {
                throw new \Exception('Order not found or invalid type');
            }
            $targetFromDate = Carbon::parse(\request()->get('target_start_date', null));
            $targetTillDate = Carbon::parse(\request()->get('target_end_date', null));
            $trampolineIds = $order->trampolines()->pluck('trampolines_id');

            $Trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolineIds)->get();

            if ($targetFromDate < Carbon::now()) {
                $Availability = (new BaseTrampoline())->getAvailability($Trampolines, $order, Carbon::now()->startOfDay(), true);
                $Occupied = (new BaseTrampoline())->getOccupation(
                    $Trampolines,
                    OccupationTimeFrames::MONTH,
                    $order,
                    true,
                    Carbon::now()->startOfDay(),
                    $targetTillDate
                );
            } else {
                $Availability = (new BaseTrampoline())->getAvailability($Trampolines, $order, $targetFromDate, true);
                $Occupied = (new BaseTrampoline())->getOccupation(
                    $Trampolines,
                    OccupationTimeFrames::MONTH,
                    $order,
                    true,
                    $targetFromDate,
                    $targetTillDate
                );
            }

            foreach ($Trampolines as $trampoline) {
                $trampoline->rental_start = Carbon::parse($Availability[0]->start)->format('Y-m-d');
                $trampoline->rental_end = Carbon::parse($Availability[0]->end)->format('Y-m-d');
            }

            return response()->json([
                'status' => true,
                'Availability' => $Availability,
                'Occupied' => $Occupied,
                'Trampolines' => $Trampolines
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function orderGet(): JsonResponse
    {
        return \response()->json([
            'status' => true,
            'order' => (new TrampolineOrder())->read(request()->get('order_id'))
        ]);
    }

    public function orderInsert(): JsonResponse
    {

        $firstVisibleDay = Carbon::parse(\request()->get('firstVisibleDay', null));
        $lastVisibleDay = Carbon::parse(\request()->get('lastVisibleDay', null));
//        dd(\request());
        $NewOrderEventBackgroundColor = 'green';
        $NewOrderEventTitle = 'Jūsų užsakymas';
        $Order = (new TrampolineOrder())->create((new TrampolineOrderData(\request())));
//        dd($Order);
        $trampolines_id = [];

        foreach (\request()->get('trampolines', []) as $Trampoline) {
            $trampolines_id[] = $Trampoline['id'];
        }
        $Trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolines_id)->get();
        if (!$Order->status) {
            $Events = [];
        } else {
            $Events = [
                (object)[
                    'id' => $Order->Order->id,
                    'extendedProps' => [
                        'trampolines' => $Trampolines,
                        'order' => $Order->Order,
                        'order_id' => $Order->Order->id
                    ],
                    'title' => $NewOrderEventTitle,
                    'start' => $Order->OrderTrampolines[0]->rental_start,
                    'end' => $Order->OrderTrampolines[0]->rental_end,
                    'backgroundColor' => $NewOrderEventBackgroundColor
                ]
            ];
        }
        Log::info('Trampolines =>', $Trampolines->toArray());
        Log::info('first visible day =>', $firstVisibleDay->toArray());
        Log::info('last visible day =>', $lastVisibleDay->toArray());

        if ($firstVisibleDay < Carbon::now()){
            $Occupied = (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                $Order->Order,
                true,
                Carbon::now()->startOfDay(),
                $lastVisibleDay
            );
        } else {
            $Occupied = (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                $Order->Order,
                true,
                $firstVisibleDay,
                $lastVisibleDay
            );
        }

        if ($Order->status) {
            $orderView = \view('orders.public.order_info', [
                'Order' => (new Order())->newQuery()->with('trampolines')->with('client')
                    ->with('address')->find($Order->Order->id),
            ])->render();
        } else {
            $orderView = null;
        }

        return response()->json([
            'failed_input' => $Order->failedInputs,
            'status' => $Order->status,
            'Occupied' => $Occupied,
            'Events' => $Events,
            'OrderId' => $Order->Order->id,
            'view' => $orderView
        ]);
    }

    public function orderUpdate(): JsonResponse
    {
//        dd(\request());
        $Order = (new TrampolineOrder())->update(new TrampolineOrderData(\request()));
//        dd($Order);

        if (!isset($Order->Order)) {
            return response()->json([
                'status' => false,
                'message' => 'Order update failed: Order data not initialized.',
                'debug' => [
                    'Order' => $Order,
                    'request' => \request()->all()
                ]
            ], 500);
        }

        $firstVisibleDay = Carbon::parse(\request()->get('firstVisibleDay', null));
        $lastVisibleDay = Carbon::parse(\request()->get('lastVisibleDay', null));
        $trampolines_id = [];
        foreach (\request()->get('trampolines', []) as $Trampoline) {
            $trampolines_id[] = $Trampoline['id'];
        }

        $trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolines_id)->get();

        if (!isset($Order->OrderTrampolines) || count($Order->OrderTrampolines) === 0) {
            return response()->json([
                'status' => false,
                'message' => 'Order update failed: Order trampolines data not initialized.',
                'debug' => [
                    'Order' => $Order
                ]
            ], 500);
        }

        $Event = [
            (object)[
                'id' => $Order->Order->id,
                'extendedProps' => [
                    'trampolines' => $trampolines,
                    'order' => $Order->Order,
                    'order_id' => $Order->Order->id
                ],
                'title' => 'Užsakymas atnaujintas',
                'start' => $Order->OrderTrampolines[0]->rental_start,
                'end' => $Order->OrderTrampolines[0]->rental_end,
                'backgroundColor' => 'green'
            ]
        ];

        if ($firstVisibleDay < carbon::now()) {
            $Occupied = (new BaseTrampoline())->getOccupation(
                $trampolines,
                OccupationTimeFrames::MONTH,
                $Order->Order,
                true,
                Carbon::now()->startOfDay(),
                $lastVisibleDay
            );
        } else {
            $Occupied = (new BaseTrampoline())->getOccupation(
                $trampolines,
                OccupationTimeFrames::MONTH,
                $Order->Order,
                true,
                $firstVisibleDay,
                $lastVisibleDay
            );
        }

        return response()->json([
            'Event' => $Event,
            'failed_input' => $Order->failedInputs,
            'status' => $Order->status,
            'Occupied' => $Occupied,
            'OrderID' => $Order->Order->id,
            'view' => \view('orders.public.order_info', [
                'Order' => (new Order())->newQuery()->with('trampolines')->with('client')
                    ->with('address')->find($Order->Order->id),
            ])->render()
        ]);
    }


    public function orderDelete(): JsonResponse
    {
        //$DeleteResult = (new TrampolineOrder())->delete((new TrampolineOrderData()));
//        dd($request);
        $deleteResult = (new TrampolineOrder())->delete(\request()->input('orderID'));
        return response()->json($deleteResult);
    }

    public function initializeOrderUpdateCalendar(): JsonResponse
    {
        $orderID = \request()->get('order_id');
        $order = (new TrampolineOrder())->read($orderID);
        $rentalStart = $order->trampolines()->pluck('rental_start')->first();
//        dd(Carbon::parse($rentalStart));

        return response()->json([
            'status' => true,
            'Dates' => (object)[
                'CalendarInitial' => Carbon::parse($rentalStart)
            ]
        ]);
    }

    public function prepareOrderUpdateModalInfo(): JsonResponse
    {
        try {
            $orderId = request()->get('order_id');
            $order = (new TrampolineOrder())->read($orderId);

            if (!$order instanceof \App\Models\Order) {
                throw new \Exception('Order not found or invalid type');
            }
            $trampolineIds = $order->trampolines()->pluck('trampolines_id')->toArray();
            $targetFromDate = Carbon::parse(request()->get('target_start_date', null));
            $targetTillDate = Carbon::parse(request()->get('target_end_date', null));

            Log::info('Target from date =>', $targetFromDate->toArray());
            Log::info('Target till date =>', $targetTillDate->toArray());


            $Trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolineIds)->get();
//            dd($Trampolines);
            $event = (object)[
                'id' => $order->id,
                'extendedProps' => [
                    'trampolines' => $Trampolines,
                    'order' => $order,
                    'order_id' => $order->id,
                    'type_custom' => 'orderEvent'
                ],
                'title' => 'Kliento užsakymas',
                'start' => Carbon::parse($order->trampolines->first()->rental_start)->format('Y-m-d'),
                'end' => Carbon::parse($order->trampolines->first()->rental_end)->format('Y-m-d'),
                'backgroundColor' => 'green'
            ];

            if ($targetFromDate < Carbon::now()) {
                $Occupied = (new BaseTrampoline())->getOccupation(
                    $Trampolines,
                    OccupationTimeFrames::MONTH,
                    $order,
                    true,
                    Carbon::now()->startOfDay(),
                    $targetTillDate
                );
            } else {
                $Occupied = (new BaseTrampoline())->getOccupation(
                    $Trampolines,
                    OccupationTimeFrames::MONTH,
                    $order,
                    true,
                    $targetFromDate,
                    $targetTillDate
                );
            }

            return response()->json([
                'status' => true,
                'Events' => [$event],
                'Occupied' => $Occupied,
                'TrampolinesID' => $trampolineIds,
                'Trampolines' => $Trampolines,
                'order' => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
