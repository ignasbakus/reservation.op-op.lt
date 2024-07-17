<?php

namespace App\Http\Controllers;

use App\Mail\OrderPlaced;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Trampoline;
use App\MontonioPayments\MontonioPaymentsService;
use App\StripePayments\StripePaymentsService;
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
            \request()->get('order', []),
            \request()->get('start_date', null),
            \request()->get('end_date', null),
            \request()->get('searchValue', '')
        );

        return response()->json([
            'status' => true,
            'DATA' => $Orders->data ?? [],
            'draw' => \request()->get('draw'),
            'list' => $Orders->List ?? [],
            'recordsTotal' => $Orders->recordsTotal ?? 0,
            'recordsFiltered' => $Orders->recordsFiltered ?? 0,
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
            ],
            'AdvancePercentage' => config('trampolines.advance_percentage'),
        ]);
    }

    public function publicGetIndexViaEmail($order_number): \Illuminate\Contracts\Foundation\Application|Factory|View|Application
    {
        $order = Order::where('order_number', $order_number)->first();
        $orderId = $order->id;
        $orderTrampolines = OrdersTrampoline::where('orders_id', $orderId)->where('is_active', 1)->first();
//        dd($orderTrampolines);


        if (!$order || !$orderTrampolines || $order->order_status !== 'Apmokėtas') {
            return view('orders.public.order_not_found');
        }
        $deliveryTime = $orderTrampolines->first();
//        dd($deliveryTime);
        $client = $order->client()->first();
        $clientAddress = $order->address()->first();
        $PaymentLink = (new MontonioPaymentsService())->retrievePaymentLink($orderId);
        $orderView = \view('orders.public.order_info', [
            'Order' => (new Order())->newQuery()->with('trampolines')->with('client')
                ->with('address')->find($order->id),
        ])->render();


        return view('orders.public.registered_order', [
            'Availability' => [],
            'Occupied' => [],
            'view' => $orderView,
            'PaymentLink' => $PaymentLink,
            'Order_trampolines' => $orderTrampolines,
            'Client' => $client,
            'ClientAddress' => $clientAddress,
            'DeliveryTime' => $deliveryTime,
            'Order_id' => $order->id,
            'Dates' => (object)[
                'CalendarInitial' => Carbon::now()->format('Y-m-d')
            ]
        ]);
    }

    public function orderWaitingConfirmation($order_number): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
//        $order = Order::where('order_number', $order_number)->firstOrFail();
        return \view('orders.public.order_waiting_confirmation', [
            'order_number' => $order_number
        ]);
    }

    public function checkPaymentStatus($order_number): JsonResponse
    {
        $order = Order::where('order_number', $order_number)->firstOrFail();
        if ($order->order_status === 'Apmokėtas') {
            return response()->json([
                'status' => true,
                'paid' => true,
                'order_number' => $order_number,
                'private_page' => url('/orders/public/order/view/' . $order_number)
            ]);
        }
        if ($order->order_status === 'Atšauktas, nes neapmokėtas') {
            return response()->json([
                'status' => true,
                'paid' => false
            ]);
        }

        return response()->json(['status' => false]);
    }

    public function publicUpdateCalendar(): JsonResponse
    {
        $trampolineIds = \request()->get('trampoline_id', []);
//        dd($trampolineIds);
        $firstVisibleDay = Carbon::parse(\request()->get('first_visible_day', null));
        $lastVisibleDay = Carbon::parse(\request()->get('last_visible_day', null));
        $firstMonthDay = Carbon::parse(\request()->get('first_month_day', null));


        $Trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolineIds)->get();
//        dd($Trampolines);

        if ($firstVisibleDay < Carbon::now()) {
            $Availability = (new BaseTrampoline())->getAvailability($Trampolines, (new Order()), Carbon::now()->startOfDay(), true);
//            dd($Availability);
            $Occupied = (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                new Order(),
                true,
                Carbon::now()->startOfDay(),
                $lastVisibleDay
            );
        } else {
            $Availability = (new BaseTrampoline())->getAvailability($Trampolines, (new Order()), $firstMonthDay, true);
            $Occupied = (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                new Order(),
                true,
                $firstVisibleDay,
                $lastVisibleDay
            );
        }

        foreach ($Trampolines as $trampoline) {
            $trampoline->rental_start = Carbon::parse($Availability[0]->start)->format('Y-m-d');
            $trampoline->rental_end = Carbon::parse($Availability[0]->end)->format('Y-m-d');
        }

        $fakeData = [
            [
                'id' => null,
                'start' => '2024-07-12',
                'end' => '2024-07-15',
                'backgroundColor' => 'red',
                'editable' => false,
                'extendedProps' => [
                    'type_custom' => 'occ'
                ]
            ],
            [
                'id' => null,
                'start' => '2024-07-17',
                'end' => '2024-07-19',
                'backgroundColor' => 'red',
                'editable' => false,
                'extendedProps' => [
                    'type_custom' => 'occ'
                ]
            ],
            [
                'id' => null,
                'start' => '2024-08-13',
                'end' => '2024-08-16',
                'backgroundColor' => 'red',
                'editable' => false,
                'extendedProps' => [
                    'type_custom' => 'occ'
                ]
            ]
        ];

//        dd($Occupied);

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
            $targetFromDate = Carbon::parse(\request()->get('first_visible_day', null));
            $targetTillDate = Carbon::parse(\request()->get('last_visible_day', null));
            $firstMonthDay = Carbon::parse(\request()->get('first_month_day', null));
            $trampolineIds = $order->trampolines()->pluck('trampolines_id');

            $Trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolineIds)->get();
//            dd($Trampolines);

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
                $Availability = (new BaseTrampoline())->getAvailability($Trampolines, $order, $firstMonthDay, true);
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
        $NewOrderEventBackgroundColor = 'green';
        $NewOrderEventTitle = 'Jūsų užsakymas';
//        dd(\request()->all());
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

        if ($firstVisibleDay < Carbon::now()) {
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
            $paymentLink = self::generatePaymentUrl($Order->Order->id);
        } else {
            $orderView = null;
            $paymentLink = null;
        }


        return response()->json([
            'failed_input' => $Order->failedInputs,
            'status' => $Order->status,
            'Occupied' => $Occupied,
            'Events' => $Events,
            'PaymentLink' => $paymentLink,
            'OrderId' => $Order->Order->id,
            'view' => $orderView
        ]);
    }

    public function orderUpdate(): JsonResponse
    {
//        dd(\request()->get('trampolines[0][rental_start]'));
        $Order = (new TrampolineOrder())->update(new TrampolineOrderData(\request()));

        if (!isset($Order->Order)) {
            return response()->json([
                'status' => false,
                'failed_input' => $Order->failedInputs,
            ]);
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
                'failed_input' => $Order->failedInputs,
            ]);
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
//    public function updateDeliveryTime(){
//
//    }
    public function orderDelete(): JsonResponse
    {
        return response()->json((new TrampolineOrder())->delete(\request()->input('orderID')));
    }

    public function orderCancel(): JsonResponse
    {
        $cancelledOrder = (new TrampolineOrder())->cancelOrder(\request()->input('order_id'));
        if ($cancelledOrder->status) {
            return response()->json([
                'status' => true,
                'message' => 'Order cancelled successfully',
                'view' => view('orders.public.successful_cancellation')->render()
            ]);
        } else {
            return response()->json([
                'status' => false,
                'failed_inputs' => $cancelledOrder->failedInputs
            ]);
        }
    }

    public function initializeOrderUpdateCalendar(): JsonResponse
    {
        $orderID = \request()->get('order_id');
        $order = (new TrampolineOrder())->read($orderID);
        $rentalStart = $order->trampolines()->pluck('rental_start')->first();

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
//            dd($order);
            if (!$order instanceof \App\Models\Order) {
                throw new \Exception('Order not found or invalid type');
            }
            $trampolineIds = $order->trampolines()->pluck('trampolines_id')->toArray();
            $targetFromDate = Carbon::parse(request()->get('target_start_date', null));
            $targetTillDate = Carbon::parse(request()->get('target_end_date', null));


            $Trampolines = (new Trampoline())->newQuery()->whereIn('id', $trampolineIds)->get();

            foreach ($Trampolines as $trampoline) {
                $orderTrampoline = $order->trampolines->firstWhere('trampolines_id', $trampoline->id);
                if ($orderTrampoline) {
                    $trampoline->rental_start = Carbon::parse($orderTrampoline->rental_start)->format('Y-m-d');
                    $trampoline->rental_end = Carbon::parse($orderTrampoline->rental_end)->format('Y-m-d');
                }
            }

//            dd($Trampolines);

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

            $event = (object)[
                'id' => $order->id,
                'extendedProps' => [
                    'trampolines' => $Trampolines,
                    'order' => $order,
                    'order_id' => $order->id,
                    'type_custom' => 'orderEvent'
                ],
                'title' => 'Jūsų užsakymas',
                'start' => Carbon::parse($order->trampolines->first()->rental_start)->format('Y-m-d'),
                'end' => Carbon::parse($order->trampolines->first()->rental_end)->format('Y-m-d'),
                'backgroundColor' => 'green'
            ];

//            dd($Trampolines);

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

    public function checkForUnpaidOrders(): JsonResponse
    {
        $unpaidOrders = (new TrampolineOrder())->deleteUnpaidOrders();
        return response()->json($unpaidOrders);
//        return response()->json([
//            'status' => true,
//            'unpaidOrders' => $unpaidOrders
//        ]);
    }

    public function generatePaymentUrl($orderId): string
    {
        (new MontonioPaymentsService())->createOrder($orderId);
        return (new MontonioPaymentsService())->retrievePaymentLink($orderId);
    }
    public function deliveryPricesIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        return view('orders.public.delivery_prices');
    }
    public function contactsIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        return view('orders.public.contacts');
    }

//    public function test(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
//    {
//        return \view('test.test');
//    }
}
