<?php

namespace App\Trampolines;

use App\Interfaces\Order;
use App\Mail\OrderDeleted;
use App\Mail\OrderPlaced;
use App\Models\Client;
use App\Models\ClientAddress;
use App\Models\OrdersTrampoline;
use App\Models\Trampoline;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\MessageBag;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;

class TrampolineOrder implements Order
{
    public array $Errors;
    public array $receivedParams;
    public array $Messages;
    public bool $status;
    public \App\Models\Order $Order;
    public array $OrderTrampolines;
    public MessageBag $failedInputs;
    public function __construct()
    {
        $this->failedInputs = new MessageBag();
        $this->receivedParams = [];
        $this->Errors = [];
        $this->Messages = [];
        $this->Order = new \App\Models\Order();
    }
    public function create(TrampolineOrderData $trampolineOrderData): static
    {
        $checkResult = self::canRegisterOrder($trampolineOrderData);
        if (!$checkResult['status']) {
            $this->status = false;
            $this->failedInputs->add('error', $checkResult['message']);
            return $this;
        }

        if (!$trampolineOrderData->ValidationStatus) {
            $this->failedInputs = $trampolineOrderData->failedInputs;
            $this->status = false;
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

        DB::beginTransaction();

        try {
            $this->Order = \App\Models\Order::create([
                'order_number' => Str::uuid(),
                'order_date' => Carbon::now()->format('Y-m-d H:i:s'),
                'rental_duration' => 0,
                'delivery_address_id' => $ClientAddress->id,
                'advance_sum' => 0,
                'total_sum' => 0,
                'order_status' => 'Neapmokėtas',
                'client_id' => $Client->id
            ]);

            $OrderTotalSum = 0;
            $OrderRentalDuration = 0;

            foreach ($trampolineOrderData->Trampolines as $trampoline) {
                $RentalStart = Carbon::parse($trampoline['rental_start']);
                $RentalEnd = Carbon::parse($trampoline['rental_end']);
                $RentalDuration = $RentalStart->diffInDays($RentalEnd);
                $Trampoline = \App\Models\Trampoline::with('Parameter')->find($trampoline['id']);

                $this->OrderTrampolines[] = OrdersTrampoline::create([
                    'orders_id' => $this->Order->id,
                    'trampolines_id' => $Trampoline->id,
                    'rental_start' => $RentalStart->format('Y-m-d'),
                    'rental_end' => $RentalEnd->format('Y-m-d'),
                    'rental_duration' => $RentalDuration,
                    'total_sum' => $RentalDuration * $Trampoline->Parameter->price,
                    'is_active' => 1
                ]);

                $OrderTotalSum += $RentalDuration * $Trampoline->Parameter->price;
                $OrderRentalDuration = $RentalDuration;
            }

            $advanceSum = self::calculateAdvanceSum($OrderTotalSum);
            $this->Order->update([
                'total_sum' => $OrderTotalSum,
                'rental_duration' => $OrderRentalDuration,
                'advance_sum' => $advanceSum
            ]);

            DB::commit();

            $this->Order->load('trampolines');

            $this->status = true;

            return $this;
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('An error occurred while creating the order', ['error' => $e->getMessage()]);
            $this->status = false;
            $this->failedInputs->add('error', 'An error occurred while creating the order.');
            return $this;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('An error occurred while creating the order', ['error' => $e->getMessage()]);
            $this->status = false;
            $this->failedInputs->add('error', 'An error occurred while creating the order.');
            return $this;
        }
    }
    public function update(TrampolineOrderData $trampolineOrderData): static
    {
        if (!$trampolineOrderData->ValidationStatus) {
            $this->failedInputs = $trampolineOrderData->failedInputs;
            $this->status = false;
            return $this;
        }

        $order = \App\Models\Order::find($trampolineOrderData->orderID);
        if (!$order || $order->order_status === 'Atšauktas') {
            $this->status = false;
            $this->failedInputs->add('error', 'Nepavyko atnaujinti. Užsakymas nerastas/atšauktas.');
            return $this;
        }
        $datesChanged = false;

        foreach ($trampolineOrderData->Trampolines as $trampoline) {
            $existingTrampoline = $order->trampolines()->where('trampolines_id', $trampoline['id'])->first();

            if ($existingTrampoline) {
                $existingRentalStart = Carbon::parse($existingTrampoline->rental_start)->format('Y-m-d');
                $existingRentalEnd = Carbon::parse($existingTrampoline->rental_end)->format('Y-m-d');
                $newRentalStart = Carbon::parse($trampoline['rental_start'])->format('Y-m-d');
                $newRentalEnd = Carbon::parse($trampoline['rental_end'])->format('Y-m-d');

                if ($existingRentalStart !== $newRentalStart || $existingRentalEnd !== $newRentalEnd) {
                    $datesChanged = true;
                    break;
                }
            } else {
                $datesChanged = true;
                break;
            }
        }

        if ($datesChanged) {
            $checkResult = self::canRegisterOrder($trampolineOrderData);
            if (!$checkResult['status']) {
                $this->status = false;
                $this->failedInputs->add('error', $checkResult['message']);
                return $this;
            }
        }

        $Order = \App\Models\Order::updateOrCreate(
            [
                'id' => $trampolineOrderData->orderID
            ]
        );

        $this->Order = $Order;

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
        $OrderTotalSum = 0;
        $OrderRentalDuration = 0;
        try {
            foreach ($trampolineOrderData->Trampolines as $trampoline) {
                $RentalStart = Carbon::parse($trampoline['rental_start'] ?? OrdersTrampoline::where('orders_id', $trampolineOrderData->orderID)->first()->rental_start);
                $RentalDuration = $RentalStart->diffInDays(Carbon::parse($trampoline['rental_end'] ?? OrdersTrampoline::where('orders_id', $trampolineOrderData->orderID)->first()->rental_end));
                $Trampoline = \App\Models\Trampoline::with('Parameter')->find($trampoline['id']);
//                dd($Trampoline);
                $this->OrderTrampolines[] = OrdersTrampoline::updateOrCreate(
                    [
                        'orders_id' => $Order->id,
                        'trampolines_id' => $Trampoline->id,
                    ],
                    [
                        'rental_start' => Carbon::parse($trampoline['rental_start'] ?? OrdersTrampoline::where('orders_id', $trampolineOrderData->orderID)->first()->rental_start)->format('Y-m-d'),
                        'rental_end' => Carbon::parse($trampoline['rental_end'] ?? OrdersTrampoline::where('orders_id', $trampolineOrderData->orderID)->first()->rental_end)->format('Y-m-d'),
                        'rental_duration' => $RentalDuration,
                        'total_sum' => $RentalDuration * $Trampoline->Parameter->price,
                    ]
                );
                $OrderTotalSum += $RentalDuration * $Trampoline->Parameter->price;
                $OrderRentalDuration = $RentalDuration;
            }
        } catch (\Exception $exception) {
            $this->Errors[] = 'Atnaujinant užsakymą įvyko klaida : ' . $exception->getMessage();
            $this->status = false;
        }
        $Order->updateOrCreate(
            [
                'id' => $Order->id,
            ],
            [
                'total_sum' => $OrderTotalSum,
                'rental_duration' => $OrderRentalDuration
            ]
        );
//        dd($this);
        $this->status = true;
        $this->Messages[] = 'Užsakymas atnaujintas sėkmingai !';
        return $this;
    }
    public function delete($orderID): static
    {
        try {

            $order = \App\Models\Order::find($orderID);

//            Mail::to($order->client->email)->send(new OrderDeleted($order));

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
        return \App\Models\Order::with('trampolines', 'client', 'address')->find($orderID);
    }
    public static function canRegisterOrder(TrampolineOrderData $trampolineOrderData): array
    {
        foreach ($trampolineOrderData->Trampolines as $trampoline) {
            $trampolineId = $trampoline['id'];
            $rentalStart = Carbon::parse($trampoline['rental_start'])->format('Y-m-d');
            $rentalEnd = Carbon::parse($trampoline['rental_end'])->format('Y-m-d');
            $orderId = $trampolineOrderData->orderID ?? null; // check if orderID exists

            $overlappingRentals = DB::table('orders_trampolines')
                ->where('trampolines_id', $trampolineId)
                ->where('is_active', 1) // Only consider active orders
                ->when($orderId, function ($query, $orderId) {
                    // exclude the current order from the check if orderID exists
                    return $query->where('orders_id', '!=', $orderId);
                })
                ->where(function ($query) use ($rentalStart, $rentalEnd) {
                    $query->where(function ($query) use ($rentalStart) {
                        // rental_start is between existing rental_start and rental_end
                        $query->where('rental_start', '<=', $rentalStart)
                            ->where('rental_end', '>', $rentalStart)
                            ->where('rental_end', '!=', DB::raw("DATE_ADD('$rentalStart', INTERVAL 0 SECOND)"));
                    })->orWhere(function ($query) use ($rentalEnd) {
                        // rental_end is between existing rental_start and rental_end
                        $query->where('rental_start', '<', $rentalEnd)
                            ->where('rental_end', '>=', $rentalEnd)
                            ->where('rental_start', '!=', DB::raw("DATE_ADD('$rentalEnd', INTERVAL 0 SECOND)"));
                    })->orWhere(function ($query) use ($rentalStart, $rentalEnd) {
                        // existing rental period is entirely within the new rental period
                        $query->where('rental_start', '>=', $rentalStart)
                            ->where('rental_end', '<=', $rentalEnd);
                    });
                })
                ->exists();

            // Debug output to check the result of the query
//            dd($overlappingRentals);

            if ($overlappingRentals) {
                return [
                    'status' => false,
                    'message' => 'Dienos, kurias pasirinkote jau yra rezervuotos. Atsiprašome už nesklandumus.'
                ];
            }
        }
        return ['status' => true];
    }
    public static function calculateAdvanceSum($totalSum): float
    {
        $advancePercentage = config('trampolines.advance_percentage');
        $advancePayment = $totalSum * $advancePercentage;
        return round($advancePayment, -1);
    }
    public function deleteUnpaidOrders(): static
    {
        $now = Carbon::now();
        $unpaidOrders = \App\Models\Order::where('order_status', 'Neapmokėtas')->get();
        foreach ($unpaidOrders as $order) {
            $orderDate = Carbon::parse($order->order_date);
            if (abs($now->diffInHours($orderDate, false)) > 48) {
                $order->trampolines()->delete();
                $order->client()->delete();
                $order->address()->delete();
                $this->status = $order->delete();
                $this->Messages[] = 'Neapmokėti užsakymai ištrinti sėkmingai !';
            }
        }
        return $this;
    }
    public function cancelOrder($orderID, $isFromWebhook = false): static{
        Log::info('Patekom i cancel order is montonioPaymentServices');
        $order = \App\Models\Order::find($orderID);
        $orderTrampolines = OrdersTrampoline::where('orders_id', $orderID)->get();
        $orderRentalStart = Carbon::parse($orderTrampolines->first()->rental_start)->format('Y-m-d');
        $now = Carbon::now();
        if (!$order) {
            Log::info('neradom orderio');
            $this->status = false;
            $this->failedInputs->add('error', 'Order not found.');
            return $this;
        }
        if ($now->diffInDays($orderRentalStart, false) < 3) {
            $this->status = false;
            $this->failedInputs->add('error', 'Užsakymo atšaukti negalima, nes liko mažiau nei 3 dienos iki pirmosios rezervacijos dienos');
            return $this;
        }

        if (!$isFromWebhook) {
            $order->update(['order_status' => 'Atšauktas kliento']);
        } else {
            $order->update(['order_status' => 'Atšauktas, nes neapmokėtas']);
        }
        foreach ($orderTrampolines as $orderTrampoline) {
            $orderTrampoline->update(['is_active' => 0]);
        }
        $this->status = true;
        $this->Messages[] = 'Užsakymas atšauktas sėkmingai !';
        Log::info('Atšaukimo message ->', $this->Messages[0]);
        return $this;
    }
    public function updateOrderStatus($orderId): array
    {
        $order = \App\Models\Order::find($orderId);
        if (!$order) {
            return [
                'status' => false,
                'message' => 'Order not found.'
            ];
        }

        $order->update(['order_status' => 'Apmokėtas']);
        return [
            'status' => true,
            'message' => 'Order status updated to Apmokėta successfully.'
        ];
    }
}
