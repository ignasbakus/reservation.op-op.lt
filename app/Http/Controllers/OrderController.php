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
        return view ('orders.public.order',[
            'Events' => [
                (object)[
                    'id' => 123,
                    'title' => $OrderEventName,
                    'start' => '2024-05-26', //@todo FIND THE FREE START DAY THROUGH OCCUPATION
                    'end' => '2024-05-29', //@todo FIND THE FREE END DAY THROUGH OCCUPATION
                ]
            ],
            'Occupied' => (new BaseTrampoline())->getOccupation(
                $Trampolines,
                OccupationTimeFrames::MONTH,
                true
            ),
            'Trampolines' => $Trampolines,
            'Dates' => (object)[
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
