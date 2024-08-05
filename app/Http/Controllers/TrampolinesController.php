<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Auth\ConfirmPasswordController;
use App\Models\Parameter;
use App\Models\Trampoline;
use App\Trampolines\BaseTrampoline;
use App\Trampolines\BaseTrampolineData;
use App\Trampolines\DataTablesProcessing;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Illuminate\Support\Facades\Validator;

class TrampolinesController extends Controller
{
    public function privateIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
        return view('trampolines.private.admin_index');
    }

    public function publicIndex(): View|Application|Factory|\Illuminate\Contracts\Foundation\Application
    {
//        $TrampolinesPhotos = [
//            0 => 'https://media.diy.com/is/image/KingfisherDigital/costway-inflatable-bounce-house-kids-bouncy-castle-outdoor-indoor-playhouse~6085651291834_01c_MP?$MOB_PREV$&$width=768&$height=768',
//            1 => 'https://littlekidsjumpingcastles.com.au/cdn/shop/products/9003rsmall_81333141-e43c-48ac-96ef-a8d3f75b0764.jpg?v=1679959240',
//            2 => 'https://image.smythstoys.com/zoom/126338_1.jpg',
//            //4 => '',
//            //5 => '',
//            //6 => '',
//        ];return
//        return \view('mail.user.orders.order-placed');
        $Trampolines = (new Trampoline)->with('images', 'Parameter')
            ->whereHas('Parameter', function($query) {
                $query->where('activity', 1);
            })
            ->orderBy('id', 'asc')
            ->get();

//        dd($Trampolines);

        foreach ($Trampolines as $index => $trampoline) {
            if ($index == 0) {
                $trampoline->active = 1;
            }

            // Set the first image for carousel
            if ($trampoline->images->isNotEmpty()) {
                $trampoline->image_url = $trampoline->images->first()->image;
            } else {
                $trampoline->image_url = '/images/no_photo.PNG'; // Fallback image
            }

            // Store all image URLs for modal
            $trampoline->image_urls = $trampoline->images->pluck('image');
        }
//        dd($Trampolines);
//        dd($Trampolines->Parameter);
//        foreach ($Trampolines as $Index => $trampoline) {
//            if ($Index == 0) {
//                $trampoline->active = 1;
//            }
//            try {
//                $trampoline->image_url = $TrampolinesPhotos[$Index];
//            } catch (\Exception $exception) {
//                $trampoline->image_url = '/images/no_photo.PNG';
//            }
//        }
        return view('trampolines.public.index', [
            'Trampolines' => $Trampolines,
            'firstTrampolineId' => $Trampolines->isEmpty() ? null : $Trampolines->first()->id,
            'Unit_of_measure' => config('trampolines.unit_of_measure')
        ]);
    }

    /**
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     */
    public function publicRenderSelectedTrampolines(): JsonResponse
    {
        return response()->json((object)[
            'view' => view('trampolines.public.selected_trampolines', [
                'Trampolines' => (new Trampoline())->newQuery()->with('Parameter')->whereIn('id', \request()->get('chosenTrampolines', []))->get()
            ])->render(),
            'ChosenTrampolines' => \request()->get('chosenTrampolines', [])
        ]);
    }

    public function adminGetDatatable(): JsonResponse
    {
//        dd(\request()->get('filterInactive'));
        $Trampolines = (new DataTablesProcessing())->getPaginatedData(
            new Trampoline(),
            ['Parameter'],
            \request()->get('length', 0),
            \request()->get('start', 0),
            \request()->get('order', []),
            null,
            null,
            null,
            \request()->get('filterActive'),
            \request()->get('filterInactive')
        );

        return response()->json([
            'status' => true,
            'DATA' => $Trampolines->data,
            'draw' => \request()->get('draw'),
            'list' => $Trampolines->List,
            'recordsTotal' => $Trampolines->recordsTotal ?? 0,
            'recordsFiltered' => $Trampolines->recordsFiltered ?? 0,
        ]);
    }

    public function adminGet(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'trampoline' => (new BaseTrampoline())->read(request()->get('trampoline_id'))
        ]);
    }

    public function adminInsert(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'trampolineName' => 'required|min:5|max:50',
            'trampolineDescription' => 'required|max:2000|min:5',
            'trampolineColor' => 'required|min:3|max:50',
            'trampolineHeight' => 'required|numeric|min:1',
            'trampolineWidth' => 'required|numeric|min:1',
            'trampolineLength' => 'required|numeric|min:1',
            'trampolinePrice' => 'required|numeric|min:1'
        ], [
            'trampolineName.required' => 'Pavadinimas yra privalomas',
            'trampolineName.min' => 'Pavadinimas turi būti nemažesnis nei 5 simboliai',
            'trampolineName.max' => 'Pavadinimas turi būti ne ilgesnis nei 50 simbolių',

            'trampolineDescription.required' => 'Aprašymas yra privalomas',
            'trampolineDescription.min' => 'Aprašymas turi būti nemažesnis nei 5 simboliai',
            'trampolineDescription.max' => 'Aprašymas per ilgas, turi būti ne ilgesnis nei 2000 simbolių',

            'trampolineColor.required' => 'Spalva yra privaloma',
            'trampolineColor.min' => 'Spalva turi būti nemažesnė nei 3 simboliai',
            'trampolineColor.max' => 'Spalva turi būti ne ilgesnė nei 50 simbolių',

            'trampolineHeight.required' => 'Batuto aukštis yra privalomas',
            'trampolineHeight.numeric' => 'Batuto aukštis turi būti skaičius',
            'trampolineHeight.min' => 'Batuto aukštis turi būti bent 1',

            'trampolineWidth.required' => 'Batuto plotis yra privalomas',
            'trampolineWidth.numeric' => 'Batuto plotis turi būti skaičius',
            'trampolineWidth.min' => 'Batuto plotis turi būti bent 1',

            'trampolineLength.required' => 'Batuto ilgis yra privalomas',
            'trampolineLength.numeric' => 'Batuto ilgis turi būti skaičius',
            'trampolineLength.min' => 'Batuto ilgis turi būti bent 1',

            'trampolinePrice.required' => 'Batuto kaina yra privaloma',
            'trampolinePrice.numeric' => 'Batuto kaina turi būti skaičius',
            'trampolinePrice.min' => 'Batuto kaina turi būti bent 1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'received_params' => request()->all(),
                'failed_input' => $validator->errors(),
            ]);
        }
        (new BaseTrampoline())->register((new BaseTrampolineData($request)));
        return response()->json([
            'status' => true,
            'received_params' => $validator->validated(),
            'failed_input' => $validator->errors(),
            'draw' => \request()->get('draw'),
        ]);
    }

    public function adminUpdate(): JsonResponse
    {
        $validator = Validator::make(request()->all(), [
            'trampolineName' => 'required|min:5|max:50',
            'trampolineDescription' => 'required|max:2000|min:5',
            'trampolineColor' => 'required|min:3|max:50',
            'trampolineHeight' => 'required|numeric|min:1',
            'trampolineWidth' => 'required|numeric|min:1',
            'trampolineLength' => 'required|numeric|min:1',
            'trampolinePrice' => 'required|numeric|min:1'
        ], [
            'trampolineName.required' => 'Pavadinimas yra privalomas',
            'trampolineName.min' => 'Pavadinimas turi būti nemažesnis nei 5 simboliai',
            'trampolineName.max' => 'Pavadinimas turi būti ne ilgesnis nei 50 simbolių',

            'trampolineDescription.required' => 'Aprašymas yra privalomas',
            'trampolineDescription.min' => 'Aprašymas turi būti nemažesnis nei 5 simboliai',
            'trampolineDescription.max' => 'Aprašymas per ilgas, turi būti ne ilgesnis nei 2000 simbolių',

            'trampolineColor.required' => 'Spalva yra privaloma',
            'trampolineColor.min' => 'Spalva turi būti nemažesnė nei 3 simboliai',
            'trampolineColor.max' => 'Spalva turi būti ne ilgesnė nei 50 simbolių',

            'trampolineHeight.required' => 'Batuto aukštis yra privalomas',
            'trampolineHeight.numeric' => 'Batuto aukštis turi būti skaičius',
            'trampolineHeight.min' => 'Batuto aukštis turi būti bent 1',

            'trampolineWidth.required' => 'Batuto plotis yra privalomas',
            'trampolineWidth.numeric' => 'Batuto plotis turi būti skaičius',
            'trampolineWidth.min' => 'Batuto plotis turi būti bent 1',

            'trampolineLength.required' => 'Batuto ilgis yra privalomas',
            'trampolineLength.numeric' => 'Batuto ilgis turi būti skaičius',
            'trampolineLength.min' => 'Batuto ilgis turi būti bent 1',

            'trampolinePrice.required' => 'Batuto kaina yra privaloma',
            'trampolinePrice.numeric' => 'Batuto kaina turi būti skaičius',
            'trampolinePrice.min' => 'Batuto kaina turi būti bent 1',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'received_params' => request()->all(),
                'failed_input' => $validator->errors(),
            ]);
        }

        (new BaseTrampoline())->update((new BaseTrampolineData(\request())));
        return response()->json([
            'status' => true,
            'received_params' => $validator->validated(),
            'failed_input' => $validator->errors(),
        ]);
    }

    public function adminDelete(): JsonResponse
    {
        (new BaseTrampoline())->delete((new BaseTrampolineData(\request())));
        return response()->json([
            'status' => true
        ]);
    }

    public function calendarIndex(): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
    {
//        return view('trampolines.private.calendar_index', []);
        return view('trampolines.private.calendar_index_building', []);
    }

//    public function createOrderForm (): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
//    {
//        Log::info(json_encode(\request()->all()));
//        return view ('orders.public.order');
//    }

}
