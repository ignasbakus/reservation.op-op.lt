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
        //$Trampolines = (new Trampoline())->newQuery()->whereIn('id', \request()->get('trampoline_id', []))->get();
        //$Availability = (new BaseTrampoline())->getAvailability($Trampolines, Carbon::now()->startOfDay(), true);
//        dd($Availability);
        /*foreach ($Trampolines as $trampoline) {
            $trampoline->rental_start = Carbon::parse($Availability[0]->start)->format('Y-m-d');
            $trampoline->rental_end = Carbon::parse($Availability[0]->end)->format('Y-m-d');
        }*/
        return view('orders.public.order', [
            'Availability' => [],/*$Availability*/
            /*Occupation info get through AJAX when DOM is formed*/
            'Occupied' => []
            /*(new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                new Order(),
                true,
                Carbon::parse(\request()->get('calendar_visible_first_date')),
                Carbon::parse(\request()->get('calendar_visible_last_date')),
            )*/,
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

        $Occupied = (new BaseTrampoline())->getOccupation(
            $Trampolines,
            OccupationTimeFrames::MONTH,
            new Order(),
            true,
            $targetFromDate,
            $targetTillDate
        );

        Log::info('FromDate sent to getAvailability', $targetFromDate->toArray());

        if ($targetFromDate < Carbon::now()){
            $Availability = (new BaseTrampoline())->getAvailability($Trampolines, Carbon::now()->startOfDay(), true);
        } else {
            $Availability = (new BaseTrampoline())->getAvailability($Trampolines, $targetFromDate, true);
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
    }


    public function orderGet(): JsonResponse
    {
        return \response()->json([
            'status' => true,
            'order' => (new TrampolineOrder())->read(request()->get('order_id'))
        ]);
    }

    public function orderInsert(Request $request): JsonResponse
    {

        /*Send notification on order create*/

//        $Order = Order::find(33);
//        $Result = Mail::to($Order->client->email)->send(new OrderPlaced($Order));
//        dd($Result);
        $firstVisibleDay = Carbon::parse(\request()->get('firstVisibleDay', null));
        $lastVisibleDay = Carbon::parse(\request()->get('lastVisibleDay', null));
        $NewOrderEventBackgroundColor = 'green';
        $NewOrderEventTitle = 'Jūsų užsakymas pateiktas';
        $Order = (new TrampolineOrder())->create((new TrampolineOrderData($request)));
        $trampolines_id = [];

        foreach ($request->get('trampolines', []) as $Trampoline) {
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

//        dd($Events);

        return response()->json([
            'failed_input' => $Order->failedInputs,
            'status' => $Order->status,
            'Occupied' => (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                $Order->Order,
                true,
                $firstVisibleDay,
                $lastVisibleDay
            ),
            'Events' => $Events
        ]);
    }

    public function orderUpdate(Request $request): JsonResponse
    {
        return response()->json((new TrampolineOrder())->update(new TrampolineOrderData($request)));
    }

    public function orderDelete(Request $request): JsonResponse
    {
        //$DeleteResult = (new TrampolineOrder())->delete((new TrampolineOrderData()));
//        dd($request);
        $deleteResult = (new TrampolineOrder())->delete($request->input('orderID'));
        return response()->json($deleteResult);
    }

    public function prepareOrderUpdateModalInfo(): JsonResponse
    {
        // Get the IDs of trampolines associated with the order
        $trampolineIds = Order::findOrFail(request()->get('order_id'))->trampolines()->pluck('trampolines_id')->toArray();
        $order = Order::findOrFail(Order::findOrFail(request()->get('order_id'))->id);
//        dd($order);
        $event = (object)[
            'id' => Order::findOrFail(request()->get('order_id'))->id,
            'extendedProps' => [
                'trampolines' => Trampoline::whereIn('id', $trampolineIds)->get()->toArray(),
                'order' => Order::findOrFail(request()->get('order_id')),
                'order_id' => Order::findOrFail(request()->get('order_id'))->id
            ],
            'title' => 'Kliento užsakymas',
            'start' => Carbon::parse(Order::findOrFail(request()->get('order_id'))->trampolines()->first()->rental_start)->format('Y-m-d'),
            'end' => Carbon::parse(Order::findOrFail(request()->get('order_id'))->trampolines()->first()->rental_end)->format('Y-m-d'),
            'backgroundColor' => 'green'
        ];
        return \response()->json([
            'status' => true,
            'Events' => [$event],
            'Trampolines' => $trampolineIds,
            'Occupied' => (new BaseTrampoline())->getOccupation(Trampoline::whereIn('id', $trampolineIds)->get(), OccupationTimeFrames::MONTH, $order, true),
            'order' => (new TrampolineOrder())->read(request()->get('order_id')),
            'Dates' => (object) [
                'CalendarInitial' => Carbon::parse(Order::findOrFail(request()->get('order_id'))->trampolines()->first()->rental_start)->startOfMonth()->format('Y-m-d')
            ]
        ]);
    }
}
