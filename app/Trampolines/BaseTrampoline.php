<?php

namespace App\Trampolines;

use App\Interfaces\Trampoline;
use App\Models\Client;
use App\Models\ClientAddress;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Parameter;
use Carbon\Carbon;
use Faker\Provider\Base;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class BaseTrampoline implements Trampoline
{
    public function register(BaseTrampolineData $TrampolineData): void
    {
        $Trampoline = \App\Models\Trampoline::create([
            'title' => $TrampolineData->trampolineName,
            'description' => $TrampolineData->trampolineDescription,
        ]);
        Parameter::create([
            'trampolines_id' => $Trampoline->id,
            'color' => $TrampolineData->trampolineColor,
            'height' => $TrampolineData->trampolineHeight,
            'width' => $TrampolineData->trampolineWidth,
            'length' => $TrampolineData->trampolineLength,
            'rental_duration' => $TrampolineData->trampolineRentalDuration,
            'rental_duration_type' => $TrampolineData->trampolineRentalDurationType,
            'activity' => $TrampolineData->trampolineActivity,
            'price' => $TrampolineData->trampolinePrice
        ]);
    }

    public function update(BaseTrampolineData $TrampolineData): void
    {
        $trampoline = \App\Models\Trampoline::updateOrCreate(
            [
                'id' => $TrampolineData->trampolineID
            ],
            [
                'title' => $TrampolineData->trampolineName,
                'description' => $TrampolineData->trampolineDescription,
            ]
        );
        Parameter::updateOrCreate(
            [
                'trampolines_id' => $trampoline->id,
            ],
            [
                'color' => $TrampolineData->trampolineColor,
                'height' => $TrampolineData->trampolineHeight,
                'width' => $TrampolineData->trampolineWidth,
                'length' => $TrampolineData->trampolineLength,
                'rental_duration' => $TrampolineData->trampolineRentalDuration,
                'rental_duration_type' => $TrampolineData->trampolineRentalDurationType,
                'activity' => $TrampolineData->trampolineActivity,
                'price' => $TrampolineData->trampolinePrice
            ]
        );

    }

    public function delete(BaseTrampolineData $TrampolineData): void
    {
        $trampoline = \App\Models\Trampoline::find($TrampolineData->trampolineID);
        $trampoline->Parameter()->delete();
        $trampoline->delete();
    }

    public function read($TrampolineID): Model|Collection|Builder|array|null
    {
        return \App\Models\Trampoline::with('Parameter')->find($TrampolineID);
    }

    public function rent(TrampolineOrderData $trampolineOrderData): static
    {

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

        $ClientAddress = ClientAddress::create([
            'clients_id' => $Client->id,
            'address_street' => $trampolineOrderData->Address,
            'address_town'  => $trampolineOrderData->City,
            'address_postcode'  => $trampolineOrderData->PostCode,
            'address_country'  => ''
        ]);

        $NewOrder = Order::create([
            'order_number'  => '',
            'order_date' => Carbon::now()->format('Y-m-d H:i:s'),
            'rental_duration'  => 5,
            'delivery_address_id' => $ClientAddress->id,
            'advance_sum' => 0,
            'total_sum' => 0,
            'client_id' => $Client->id
        ]);

        foreach ($trampolineOrderData->Trampolines as $trampoline) {
            $RentalStart = Carbon::parse($trampoline->rental_start);
            $RentalDuration = $RentalStart->diffInDays(Carbon::parse($trampoline->rental_end));
            $Trampoline = \App\Models\Trampoline::find($trampoline->id);
            OrdersTrampoline::create([
                'orders_id' => $NewOrder->id,
                'trampolines_id' => $trampoline->id,
                'rental_start' => Carbon::now()->format('Y-m-d H:i:s'),
                'rental_end' => Carbon::now()->format('Y-m-d H:i:s'),
                'rental_duration' => $RentalDuration,
                'total_sum' => $RentalDuration * $Trampoline->price,
            ]);
        }

        return $this;
    }

    public function cancelRent()
    {
        // TODO: Implement cancelRent() method.
    }

    public function makeRentable()
    {
        // TODO: Implement makeRentable() method.
    }

    public function onHold()
    {
        // TODO: Implement onHold() method.
    }

    public function getOccupation(Collection $Trampolines,OccupationTimeFrames $TimeFrame, $FullCalendarFormat = false): array
    {
        switch ($TimeFrame) {
            case OccupationTimeFrames::WEEK :
                $GetOccupationFrom = Carbon::now()->startOfWeek()->format('Y-m-d');
                $GetOccupationTill = Carbon::now()->endOfWeek()->format('Y-m-d');
                break;
            case OccupationTimeFrames::MONTH :
                $GetOccupationFrom = Carbon::now()->startOfMonth()->format('Y-m-d');
                $GetOccupationTill = Carbon::now()->endOfMonth()->format('Y-m-d');
                break;
        }
        /*Make occupation object for $trampoline for current : week, month [$GetOccupationFrom <> $GetOccupationTill] */
        /*foreach ($Trampolines as $trampoline) {
        }*/
        /*Occupation array for $Trampolines in $FullCalendarFormat format*/
        return [
            (object)[
                'id' => 1,
                'title' => "Užimta",
                'start' => '2024-05-01 00:00:00',
                'end' => '2024-05-11 00:00:00',
                'backgroundColor' => 'red',
                'type_custom' => 'occ'
            ],
            (object)[
                'id' => 2,
                'title' => "Užimta",
                'start' => '2024-05-14 00:00:00',
                'end' => '2024-05-16 00:00:00',
                'backgroundColor' => 'red',
                'type_custom' => 'occ'
            ],
            (object)[
                'id' => 3,
                'title' => "Užimta",
                'start' => '2024-05-21 00:00:00',
                'end' => '2024-05-25 00:00:00',
                'backgroundColor' => 'red',
                'type_custom' => 'occ'
            ],
        ];
    }
}
