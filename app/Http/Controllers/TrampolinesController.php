<?php

namespace App\Http\Controllers;

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
        $TrampolinesPhotos = [
            0 => 'https://media.diy.com/is/image/KingfisherDigital/costway-inflatable-bounce-house-kids-bouncy-castle-outdoor-indoor-playhouse~6085651291834_01c_MP?$MOB_PREV$&$width=768&$height=768',
            1 => 'https://littlekidsjumpingcastles.com.au/cdn/shop/products/9003rsmall_81333141-e43c-48ac-96ef-a8d3f75b0764.jpg?v=1679959240',
            2 => 'https://image.smythstoys.com/zoom/126338_1.jpg',
            //4 => '',
            //5 => '',
            //6 => '',
        ];
        $Trampolines = (new Trampoline)->with('Parameter')->orderBy('id', 'asc')->get();
        foreach ($Trampolines as $Index => $trampoline) {
            if ($Index == 0) {
                $trampoline->active = 1;
            }
            try {
                $trampoline->image_url = $TrampolinesPhotos[$Index];
            } catch (\Exception $exception) {
                $trampoline->image_url = '/images/no_photo.PNG';
            }
        }
        return view('trampolines.public.index', [
            'Trampolines' => $Trampolines
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
        $Trampolines = (new DataTablesProcessing())->getPaginatedData(new Trampoline(), ['Parameter'], \request()->get('length', 0), \request()->get('start', 0), \request()->get('order', []));
        return response()->json([
            'status' => true,
            'DATA' => $Trampolines->data,
            'draw' => \request()->get('draw'),
            'list' => $Trampolines->List,
            'recordsTotal' => $Trampolines->recordsTotal,
            'recordsFiltered' => $Trampolines->recordsFiltered,
        ]);
    }

    /**
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     * @throws ValidationException
     */

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
            'trampolineName' => 'required|min:5',
            'trampolineDescription' => 'max:255',
            'trampolineColor' => 'required|min:3',
            'trampolineHeight' => 'required|numeric|min:1',
            'trampolineWidth' => 'required|numeric|min:1',
            'trampolineLength' => 'required|numeric|min:1',
            'trampolinePrice' => 'required|numeric|min:1'
        ], [
            'trampolineName.required' => 'Pavadinimas yra privalomas',
            'trampolineName.min' => 'Pavadinimas turi būti nemažesnis nei 5 simboliai',
            'trampolineDescription.max' => 'Aprašymas per ilgas',
            'trampolineColor.required' => 'Spalva yra privaloma',
            'trampolineColor.min' => 'Spalva turi būti nemažesnė nei 5 simboliai',
            'trampolineHeight.required' => 'Batuto aukštis yra privalomas',
            'trampolineWidth.required' => 'Batuto plotis yra privalomas',
            'trampolineLength.required' => 'Batuto ilgis yra privalomas',
            'trampolinePrice.required' => 'Batuto kaina yra privaloma',
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
            'trampolineName' => 'required|min:5',
            'trampolineDescription' => 'max:255',
            'trampolineColor' => 'required|min:3',
            'trampolineHeight' => 'required|numeric|min:1',
            'trampolineWidth' => 'required|numeric|min:1',
            'trampolineLength' => 'required|numeric|min:1',
            'trampolinePrice' => 'required|numeric|min:1'
        ], [
            'trampolineName.required' => 'Pavadinimas yra privalomas',
            'trampolineName.min' => 'Pavadinimas turi būti nemažesnis nei 5 simboliai',
            'trampolineDescription.max' => 'Aprašymas per ilgas',
            'trampolineColor.required' => 'Spalva yra privaloma',
            'trampolineColor.min' => 'Spalva turi būti nemažesnė nei 5 simboliai',
            'trampolineHeight.required' => 'Batuto aukštis yra privalomas',
            'trampolineWidth.required' => 'Batuto plotis yra privalomas',
            'trampolineLength.required' => 'Batuto ilgis yra privalomas',
            'trampolinePrice.required' => 'Batuto kaina yra privaloma',
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
        return view('trampolines.private.calendar_index', []);
    }

//    public function createOrderForm (): Factory|Application|View|\Illuminate\Contracts\Foundation\Application
//    {
//        Log::info(json_encode(\request()->all()));
//        return view ('orders.public.order');
//    }

}
