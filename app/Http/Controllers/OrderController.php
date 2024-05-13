<?php

namespace App\Http\Controllers;

use App\Models\Trampoline;
use App\Trampolines\BaseTrampoline;
use App\Trampolines\OccupationTimeFrames;
use App\Trampolines\TrampolineOrderData;
use Carbon\Carbon;
use http\Env\Response;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;


class OrderController extends Controller
{
    public function adminGetIndex()
    {

    }

    public function publicGetIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        $Trampolines = (new Trampoline())->newQuery()->whereIn('id',\request()->get('trampoline_id',[]))->get();
        $Availability = (new BaseTrampoline())->getAvailability($Trampolines, Carbon::now(), true);
        foreach ($Trampolines as $trampoline) {
            $trampoline->rental_start = Carbon::parse($Availability[0]->start)->format('Y-m-d');
            $trampoline->rental_end = Carbon::parse($Availability[0]->end)->format('Y-m-d');
        }
        return view ('orders.public.order',[
            'Availability' => $Availability
            /*[
                (object)[
                    'extendedProps' => [
                        'trampolines' => $Trampolines,
                    ],
                    'title' => $OrderEventName,
                    'start' => Carbon::parse($startDate)->format('Y-m-d'),
                    'end' => Carbon::parse($endDate)->format('Y-m-d')
                ]
            ]*/,
            'Occupied' => (new BaseTrampoline())->getOccupation($Trampolines, OccupationTimeFrames::MONTH, true),
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
        $validator = Validator::make($request->all(), [
            'customerName' => 'required|max:50',
            'customerSurname' => 'required|max:50',
            'customerPhoneNumber' => 'required|max:50',
            'customerEmail' => 'max:50',
            'customerDeliveryCity' => 'required|max:50',
            'customerDeliveryPostCode' => 'required|max:15',
            'customerDeliveryAddress' => 'required|max:256',
        ], [
           'customerName.required' => 'Vardas privalomas',
            'customerName.max' => 'Vardas per ilgas',
            'customerSurname.required' => 'Pavardė privaloma',
            'customerSurname.max' => 'Pavardė per ilga',
            'customerPhoneNumber.required' => 'Telefono numeris privalomas',
            'customerPhoneNumber.max' => 'Telefono numeris per ilgas',
            'customerEmail.max' => 'Elektroninio pašto adresas per ilgas',
            'customerDeliveryCity.required' => 'Miesto pavadinimas privalomas',
            'customerDeliveryCity.max' => 'Miesto pavadinimas per ilgas',
            'customerDeliveryPostCode.required' => 'Pašto kodas privalomas',
            'customerDeliveryPostCode.max' => 'Pašto kodas per ilgas',
            'customerDeliveryAddress.required' => 'Adresas privalomas',
            'customerDeliveryAddress.max' => 'Adresas per ilgas'
        ]);
        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'received_params' => request()->all(),
                'failed_input' => $validator->errors()
            ]);
        }
        $trampolines_id = [];
        foreach (\request()->get('trampolines',[])  as $Trampoline) {
            $trampolines_id[] = $Trampoline['id'];
        }
        $Trampolines = (new Trampoline())->newQuery()->whereIn('id',$trampolines_id)->get();
        $availability = (new BaseTrampoline())->getOccupation(
            $Trampolines,
            OccupationTimeFrames::MONTH,
            true
        );

        $Order = (new BaseTrampoline())->rent((new TrampolineOrderData()));
        return response()->json([
            'status' => true,
            'Occupied' => $availability,
            'Events' => [
                (object)[
                    'id' => $Order->OrderData->Order->id,
                    'extendedProps' => [
                        'trampolines' => $Trampolines,
                        'order' => $Order->OrderData,
                        'order_id' => $Order->OrderData->Order->id
                    ],
                    'title' => 'Jūsų užsakymas',
                    'start' => $Order->OrderData->OrderTrampolines[0]->rental_start, //@todo FIND THE FREE START DAY THROUGH OCCUPATION
                    'end' => $Order->OrderData->OrderTrampolines[0]->rental_end, //@todo FIND THE FREE END DAY THROUGH OCCUPATION
                    'backgroundColor' => 'green'
                ]
            ]
        ]);
    }

    public function orderUpdate()
    {

    }

    public function orderDelete()
    {

    }
}
