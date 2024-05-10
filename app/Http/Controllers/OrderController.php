<?php

namespace App\Http\Controllers;

use App\Models\Trampoline;
use App\Trampolines\BaseTrampoline;
use App\Trampolines\OccupationTimeFrames;
use App\Trampolines\TrampolineOrderData;
use Carbon\Carbon;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function adminGetIndex()
    {

    }

    public function publicGetIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        $Trampolines = (new Trampoline())->newQuery()->whereIn('id',\request()->get('trampoline_id',[]))->get();
        if (count($Trampolines) > 1) {
            $OrderEventName = 'Batutai ';
        } else {
            $OrderEventName = 'Batutas ';
        }
        foreach ($Trampolines as $trampoline) {
            $OrderEventName .= $trampoline->title.'/';
        }


        //@todo Paziureti ar sitas yra logiskas (iki $endDate)
        $availability = (new BaseTrampoline())->getOccupation(
            $Trampolines,
            OccupationTimeFrames::MONTH,
            true
        );

        Log::info('Availability: ' . json_encode($availability));

        $startDate = null;
        foreach ($availability as $occupiedSlot) {
            if ($occupiedSlot->start > Carbon::now()) {
                $startDate = $occupiedSlot->start;
                break;
            }
        }

        $endDate = $startDate ? Carbon::parse($startDate)->addDays(1)->format('Y-m-d') : null;

        if ($startDate && $endDate) {
            Log::info('Start Date: ' . $startDate->toDateString());
            Log::info('End Date: ' . $endDate->toDateString());
        } else {
            Log::info('Start Date or End Date is null.');
        }


        return view ('orders.public.order',[
            'Events' => [
                (object)[
                    'id' => 123,
                    'title' => $OrderEventName,
                    'start' => '2024-05-26', //@todo FIND THE FREE START DAY THROUGH OCCUPATION
                    'end' => '2024-05-27', //@todo FIND THE FREE END DAY THROUGH OCCUPATION
                ]
            ],
            'Occupied' => $availability,
            'Trampolines' => $Trampolines,
            'Dates' => (object)[
                'start' => $startDate,
                'end' => $endDate,
                'CalendarInitial'=>Carbon::now()->format('Y-m-d')
            ]
        ]);
    }

    public function orderGet()
    {

    }

    public function orderInsert(Request $request): JsonResponse
    {
        /*Validation*/
        /*Phone required*/
        $formData = $request->only([
            'customerName',
            'customerSurname',
            'customerPhoneNumber',
            'customerEmail',
            'customerDeliveryCity',
            'customerDeliveryPostCode',
            'customerDeliveryAddress'
        ]);

        $Order = (new BaseTrampoline())->rent((new TrampolineOrderData()));

        return response()->json([
            'status' => true,
            'received_params' => $formData
        ]);
    }

    public function orderUpdate()
    {

    }

    public function orderDelete()
    {

    }
}
