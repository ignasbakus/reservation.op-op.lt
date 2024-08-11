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
    public string $DeliveryTime;
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
                'customerName' => 'required|min:3|regex:/^[^\d]+$/',
                'customerSurname' => 'required|min:3|regex:/^[^\d]+$/',
                'customerPhoneNumber' => 'required|regex:/^\+\d{1,3}\s?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/',
                'customerEmail' => 'email',
                'customerDeliveryCity' => 'required|min:4|regex:/^[^\d]+$/',
                'customerDeliveryPostCode' => 'required|digits:5|numeric',
                'customerDeliveryAddress' => 'required|min:5',
                'customerDeliveryTime' => 'required'
            ], [
                'customerName.required' => 'Vardas privalomas',
                'customerName.min' => 'Vardas per trumpas',
                'customerName.regex' => 'Vardas negali turėti skaičių',
                'customerSurname.required' => 'Pavardė privaloma',
                'customerSurname.min' => 'Pavardė per trumpa',
                'customerSurname.regex' => 'Pavardė negali turėti skaičių',
                'customerPhoneNumber.required' => 'Telefonas privalomas',
                'customerPhoneNumber.regex' => 'Neteisingas telefono numerio formatas. Pavyzdys: +3701234567',
                'customerEmail.email' => 'Neteisingas el. pašto formatas',
                'customerDeliveryCity.required' => 'Miestas privalomas',
                'customerDeliveryCity.min' => 'Miesto pavadinimas per trumpas',
                'customerDeliveryCity.regex' => 'Miestas negali turėti skaičių',
                'customerDeliveryPostCode.required' => 'Pašto kodas privalomas',
                'customerDeliveryPostCode.digits' => 'Pašto kodas turi būti sudarytas iš 5 skaitmenų',
                'customerDeliveryPostCode.numeric' => 'Naudojami gali būti tik skaičiai',
                'customerDeliveryAddress.required' => 'Adresas privalomas',
                'customerDeliveryAddress.min' => 'Adresas per trumpas',
                'customerDeliveryTime.required' => 'Pristatymo laikas privalomas'
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
                $this->DeliveryTime = $request->get('customerDeliveryTime', '');
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
