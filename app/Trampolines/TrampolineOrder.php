<?php

namespace App\Trampolines;

use App\Interfaces\Order;
use App\Models\Client;
use App\Models\ClientAddress;
use App\Models\OrdersTrampoline;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\MessageBag;
use Illuminate\Support\Str;

class TrampolineOrder implements Order
{

    public array $Errors;
    public array $receivedParams;
    public array $Messages;
    public bool $status;
    public \App\Models\Order $Order;
    public array $OrderTrampolines;
    public \Illuminate\Support\MessageBag $failedInputs;

    public function __construct()
    {
        $this->failedInputs = new MessageBag();
        $this->receivedParams = [];
        $this->Errors = [];
        $this->Messages = [];
    }

    public function create(TrampolineOrderData $trampolineOrderData): static
    {
        if (!$trampolineOrderData->ValidationStatus) {
            $this->failedInputs = $trampolineOrderData->failedInputs;
            $this->status = false;
            try {
                $Trampoline = (object)[
                    'rental_start' => $trampolineOrderData->Trampolines[0]['rental_start'],
                    'rental_end' => $trampolineOrderData->Trampolines[0]['rental_end']
                ];
            } catch (\Exception) {
                $Trampoline = (object)[
                    'rental_start' => Carbon::parse(request()->get('trampolines')[0]['rental_start']),
                    'rental_end' => Carbon::parse(request()->get('trampolines')[0]['rental_end'])

//                    'rental_start' => Carbon::parse(request()->get('orderInputs')['trampolines'][0]['rental_start']),

                ];
            }

            $fakeOrder = new \App\Models\Order();
            $fakeOrder->id = 0;
            $fakeOrder->OrderTrampolines = [$Trampoline];

            $this->Order = $fakeOrder;

            return $this;
        }
        $Client = (new Client())->updateOrCreate(
            [
                'phone' => $trampolineOrderData->CustomerPhone,
            ],
            [
                'name' => $trampolineOrderData->CustomerName,
                'surname' => $trampolineOrderData->CustomerSurname,
                'email' => $trampolineOrderData->CustomerEmail,
                'phone' => $trampolineOrderData->CustomerPhone
            ]
        );
        $ClientAddress = ClientAddress::updateOrCreate(
            [
                'clients_id' => $Client->id,
                'address_street' => $trampolineOrderData->Address,
                'address_town' => $trampolineOrderData->City,
                'address_postcode' => $trampolineOrderData->PostCode,
                'address_country' => ''
            ],
            [
                'clients_id' => $Client->id,
                'address_street' => $trampolineOrderData->Address,
                'address_town' => $trampolineOrderData->City,
                'address_postcode' => $trampolineOrderData->PostCode,
                'address_country' => ''
            ]
        );
        /*Pakartotinis batutu prieinamumo patikrinimas !*/
        $this->Order = \App\Models\Order::create([
            'order_number' => Str::uuid(),
            'order_date' => Carbon::now()->format('Y-m-d H:i:s'),
            'rental_duration' => 0,
            'delivery_address_id' => $ClientAddress->id,
            'advance_sum' => 0,
            'total_sum' => 0,
            'client_id' => $Client->id
        ]);
        $OrderTotalSum = 0;
        $OrderRentalDuration = 0;
        foreach ($trampolineOrderData->Trampolines as $trampoline) {
            $RentalStart = Carbon::parse($trampoline['rental_start']);
            $RentalDuration = $RentalStart->diffInDays(Carbon::parse($trampoline['rental_end']));
            $Trampoline = \App\Models\Trampoline::with('Parameter')->find($trampoline['id']);
            $this->OrderTrampolines[] = OrdersTrampoline::create([
                'orders_id' => $this->Order->id,
                'trampolines_id' => $Trampoline->id,
                'rental_start' => Carbon::parse($trampoline['rental_start'])->format('Y-m-d'),
                'rental_end' => Carbon::parse($trampoline['rental_end'])->format('Y-m-d'),
                'rental_duration' => $RentalDuration,
                'total_sum' => $RentalDuration * $Trampoline->Parameter->price,
            ]);
            $OrderTotalSum += $RentalDuration * $Trampoline->Parameter->price;
            $OrderRentalDuration = $RentalDuration;
        }
        $this->Order->update([
            'total_sum' => $OrderTotalSum,
            'rental_duration' => $OrderRentalDuration
        ]);
        $this->status = true;
        return $this;
    }

    public function update(TrampolineOrderData $trampolineOrderData): static
    {
        if (!$trampolineOrderData->ValidationStatus) {
            $this->failedInputs = $trampolineOrderData->failedInputs;
            $this->status = false;
            return $this;
        }
        $Order = \App\Models\Order::updateOrCreate(
            [
                'id' => $trampolineOrderData->orderID
            ],
            [
                /*Visi parametrai*/
            ]
        );
        Client::updateOrCreate(
            [
                'id' => $Order->client_id
            ],
            [
                'name' => $trampolineOrderData->CustomerName,
                'surname' => $trampolineOrderData->CustomerSurname,
                'email' => $trampolineOrderData->CustomerEmail,
                'phone' => $trampolineOrderData->CustomerPhone
            ]
        );
        ClientAddress::updateOrCreate(
            [
                'clients_id' => $Order->delivery_address_id,
            ],
            [
                'address_street' => $trampolineOrderData->Address,
                'address_town' => $trampolineOrderData->City,
                'address_postcode' => $trampolineOrderData->PostCode
            ]
        );
        $this->status = true;
        $this->Messages[] = 'Užsakymas atnaujintas sėkmingai !';
        return $this;
    }

    public function delete($orderID): static
    {
        try {

            $order = \App\Models\Order::find($orderID);

            $order->trampolines()->delete();
            $order->client()->delete();
            $order->address()->delete();
            $this->status = $order->delete();
            $this->Messages[] = 'Užsakymas #' . $orderID . ' ištrintas sėkmingai !';
        } catch (\Exception $exception) {
            $this->Errors[] = 'Trinant užsakymą įvyko klaida : ' . $exception->getMessage();
            $this->status = false;
        }
        return $this;
    }

    public function read($orderID): Model|Collection|Builder|array|null
    {
        return \App\Models\Order::with('client', 'address')->find($orderID);
    }
}
