<?php

namespace App\Trampolines;

use App\Models\OrdersTrampoline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\MessageBag;

class TrampolineOrderData
{
    public int $orderID;
    public int $ClientID;
    public string $CustomerName;
    public string $CustomerSurname;
    public string $CustomerEmail;
    public string $CustomerPhone;
    public string $City;
    public string $PostCode;
    public string $Address;
    public array $Trampolines;

    public bool $ValidationStatus;
    public MessageBag $failedInputs;

    public function __construct(Request $request = null, array $RawData = null)
    {
        $this->Trampolines = [];
        $this->failedInputs = new MessageBag();

        if (!is_null($request)) {
            $validator = Validator::make($request->all(), [
                'customerName' => 'required|min:3',
                'customerSurname' => 'required|min:3',
                'customerPhoneNumber' => 'required',
                'customerDeliveryCity' => 'required|min:4',
                'customerDeliveryPostCode' => 'required|digits:5|numeric',
                'customerDeliveryAddress' => 'required|min:5'
            ], [
                'customerName.required' => 'Vardas privalomas',
                'customerName.min' => 'Vardas per trumpas',
                'customerSurname.required' => 'Pavardė privaloma',
                'customerSurname.min' => 'Pavardė per trumpa',
                'customerPhoneNumber.required' => 'Telefonas privalomas',
                'customerDeliveryCity.required' => 'Miestas privalomas',
                'customerDeliveryCity.min' => 'Miesto pavadinimas per trumpas',
                'customerDeliveryPostCode.required' => 'Pašto kodas privalomas',
                'customerDeliveryPostCode.digits' => 'Pašto kodas turi būti sudarytas iš 5 skaitmenų',
                'customerDeliveryPostCode.numeric' => 'Naudojami gali būti tik skaičiai',
                'customerDeliveryAddress.required' => 'Adresas privalomas',
                'customerDeliveryAddress.min' => 'Adresas per trumpas'
            ]);
            if($validator->fails()) {
                Log::info('Didnt pass validator');
                $this->ValidationStatus = false;
                $this->failedInputs = $validator->errors();
//                dd($this);
                return $this;
            } else {
                Log::info('Passed validator');
                $this->ValidationStatus = true;
                //Order id
                $this->orderID = $request->get('orderID', 0);
                //Order form -> client info
                $this->ClientID = $request->get('clientID', 0);
                $this->CustomerName = $request->get('customerName', '');
                $this->CustomerSurname = $request->get('customerSurname', '');
                $this->CustomerEmail = $request->get('customerEmail', '');
                $this->CustomerPhone = $request->get('customerPhoneNumber', '');
                Log::info('Request data: ', $request->all());
                //order form -> client address
                $this->City = $request->get('customerDeliveryCity', '');
                $this->PostCode = $request->get('customerDeliveryPostCode', '');
                $this->Address = $request->get('customerDeliveryAddress', '');
                //Trampolines -> [{id:xxx,rent_start:YYYY-MM-DD,rent_end:YYYY-MM-DD}]
                $this->Trampolines = $request->get('trampolines', []);
            }
        } else {
            $this->ValidationStatus = true;
            $this->orderID = $RawData['orderID'] ?? 0;
            $this->Trampolines = $RawData['trampolines'] ?? [];
        }
    }
}
