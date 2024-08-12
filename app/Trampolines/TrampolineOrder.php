<?php

namespace App\Trampolines;

use App\Interfaces\Order;
use App\Mail\admin\adminOrderCancelled;
use App\Mail\admin\adminOrderUpdated;
use App\Mail\admin\AdminPaidOrder;
use App\Mail\user\OrderDeleted;
use App\Mail\user\OrderNotPaid;
use App\Mail\user\OrderPaid;
use App\Mail\user\OrderPlaced;
use App\Mail\user\orderUpdated;
use App\Models\Client;
use App\Models\ClientAddress;
use App\Models\OrdersTrampoline;
use App\MontonioPayments\MontonioPaymentsService;
use Carbon\Carbon;
use http\Env\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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

//        dd($isTrampolineActive);
        if (!$trampolineOrderData->ValidationStatus) {
//            dd('patekom');
            $this->failedInputs = $trampolineOrderData->failedInputs;
            $this->status = false;
            return $this;
        }

        $checkResult = self::canRegisterOrder(null, $trampolineOrderData);

        Log::info('Check result ->' . json_encode($checkResult));

        if (!$checkResult['status']) {
            $this->status = false;
            $this->failedInputs->add('error', $checkResult['message']);
            return $this;
        }

        foreach ($trampolineOrderData->Trampolines as $trampoline) {
            $isTrampolineActive = (new BaseTrampoline())->isTrampolineActive($trampoline['id']);
            if (!$isTrampolineActive) {
                $this->status = false;
                $this->failedInputs->add('error', 'Batutas neaktyvus, prašome pasirinkti kitą');
                return $this;
            }
        }
//        $isTrampolineActive = (new BaseTrampoline())->isTrampolineActive($trampolineOrderData->Trampolines[0]['id']);


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
                'order_number' => Str::random(7),
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
                    'delivery_time' => $trampolineOrderData->DeliveryTime,
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
//            dd($this);
        } catch (QueryException|\Exception $e) {
            DB::rollBack();
            Log::error('An error occurred while creating the order', ['error' => $e->getMessage()]);
            $this->status = false;
            $this->failedInputs->add('error', 'An error occurred while creating the order.');
            return $this;
        }
    }

    public function update(TrampolineOrderData $trampolineOrderData): static
    {
//        dd($trampolineOrderData);
        if (!$trampolineOrderData->ValidationStatus) {
            $this->failedInputs = $trampolineOrderData->failedInputs;
            $this->status = false;
            return $this;
        }

        $order = \App\Models\Order::find($trampolineOrderData->orderID);
//        dd($order);
        if (!$order) {
            $this->status = false;
            $this->failedInputs->add('error', 'Nepavyko atnaujinti. Užsakymas nerastas.');
            return $this;
        }


        $datesChanged = false;

        if (!Auth::check()) {
            $days = (int)config('trampolines.amount_of_days');
            $rentalStartDb = Carbon::parse($order->trampolines()->first()->rental_start)->format('Y-m-d');
            if (Carbon::now()->startOfDay()->addDays($days) > $rentalStartDb) {
                $this->status = false;
                $this->failedInputs->add('error', 'Užsakymo atnaujinti negalima, nes liko mažiau nei ' . $days . ' dienos iki pirmosios rezervacijos dienos');
                return $this;
            }
        }

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
            $checkResult = self::canRegisterOrder(null, $trampolineOrderData);
            if (!$checkResult['status']) {
                $this->status = false;
                $this->failedInputs->add('error', $checkResult['message']);
                return $this;
            }
        }

        $this->Order = \App\Models\Order::find($trampolineOrderData->orderID);
//        dd($this->Order . ' ' . $trampolineOrderData->orderID);
        Client::updateOrCreate(
            [
                'id' => $this->Order->client_id
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
                'id' => $this->Order->delivery_address_id,
            ],
            [
                'address_street' => $trampolineOrderData->Address,
                'address_town' => $trampolineOrderData->City,
                'address_postcode' => $trampolineOrderData->PostCode
            ]
        );
//        dd($this->Order->address);
        $OrderTotalSum = 0;
        $OrderRentalDuration = 0;
        try {
            foreach ($trampolineOrderData->Trampolines as $trampoline) {
                $RentalStart = Carbon::parse($trampoline['rental_start'] ?? OrdersTrampoline::where('orders_id', $trampolineOrderData->orderID)->first()->rental_start);
                $RentalEnd = Carbon::parse($trampoline['rental_end'] ?? OrdersTrampoline::where('orders_id', $trampolineOrderData->orderID)->first()->rental_end);
                $RentalDuration = $RentalStart->diffInDays($RentalEnd);
                $Trampoline = \App\Models\Trampoline::with('Parameter')->find($trampoline['id']);
                $this->OrderTrampolines[] = OrdersTrampoline::updateOrCreate(
                    [
                        'orders_id' => $this->Order->id,
                        'trampolines_id' => $Trampoline->id,
                    ],
                    [
                        'delivery_time' => $trampolineOrderData->DeliveryTime,
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
        try {
            $this->Order->update(
                [
                    'total_sum' => $OrderTotalSum,
                    'rental_duration' => $OrderRentalDuration
                ]
            );
        } catch (\Exception $exception) {
            $this->Errors[] = 'Atnaujinant užsakymą įvyko klaida : ' . $exception->getMessage();
            $this->status = false;
        }

        Log::info('Order ->' . $this->Order);
        $this->status = true;
        $this->Messages[] = 'Užsakymas atnaujintas sėkmingai !';
        if (config('mail.send_email') === true) {
            $updatedOrder = \App\Models\Order::find($this->Order->id); // Ensure we have the latest order info
            Mail::to($updatedOrder->client->email)->send(new orderUpdated($updatedOrder));
            Mail::to(config('mail.admin_email'))->send(new adminOrderUpdated($updatedOrder));
        }
        return $this;
    }

    public function delete($request): static
    {
        try {
//            dd($request->orderID);
            $order = \App\Models\Order::find($request->orderID);

            if (config('mail.send_email') === true) {
                if (isset($request->informClient)) {
                    switch ($request->cancellationExcuse) {
                        case 'normalCancellation':
                            Mail::to($order->client->email)->send(new OrderDeleted($order));
                            break;
                        case 'technicalFailure':
                            Mail::to($order->client->email)->send(new OrderDeleted($order, 'Užsakymas buvo atšauktas
                            dėl kilusių techninių nesklandumų. Greitu metu su jumis susisieksime, jog galėtume gražinti avansą.'));
                            break;
                        case 'badWeather':
                            Mail::to($order->client->email)->send(new OrderDeleted($order, 'Užsakymas buvo atšauktas
                            dėl blogų oro sąlygų. Greitu metu su jumis susisieksime, jog galėtume gražinti avansą.'));
                            break;
                        case 'trampolineReserved':
                            Mail::to($order->client->email)->send(new OrderDeleted($order, 'Užsakymas buvo atšauktas, nes
                            batutas, kurį užsisakėte buvo užimtas. Greitu metu su jumis susisieksime, jog galėtume gražinti avansą.'));
                            break;
                        case 'paymentMissing':
                            Mail::to($order->client->email)->send(new OrderDeleted($order, 'Užsakymas buvo atšauktas, nes
                            negavome jūsų avanso apmokėjimo.'));
                            break;
                    }
                }
            }

            $order->trampolines()->delete();
//            $order->client()->delete();
//            $order->address()->delete();
            $order->paymentCreationLog()->delete();
            $order->paymentWebhooksLog()->delete();
            $this->status = $order->delete();
            $this->Messages[] = 'Užsakymas #' . $request->orderID . ' ištrintas sėkmingai !';
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

    public static function canRegisterOrder(\App\Models\Order $order = null, TrampolineOrderData $trampolineOrderData = null): array
    {
        $overlappingRentals = false;

        if ($trampolineOrderData) {
            foreach ($trampolineOrderData->Trampolines as $trampoline) {
                $trampolineId = $trampoline['id'];
                Log::info('Trampoline ID: ' . $trampolineId);

                $rentalStart = Carbon::parse($trampoline['rental_start'])->format('Y-m-d');
                Log::info('Rental Start: ' . $rentalStart);

                $rentalEnd = Carbon::parse($trampoline['rental_end'])->format('Y-m-d');
                Log::info('Rental End: ' . $rentalEnd);

                $orderId = $trampolineOrderData->orderID ?? null;
                Log::info('Order ID: ' . $orderId);

                $overlappingRentals = self::checkOverlappingRentals($trampolineId, $rentalStart, $rentalEnd, $orderId);
                if ($overlappingRentals) break;
            }
        }

        if ($order) {
            foreach ($order->trampolines as $trampoline) {
                $trampolineId = $trampoline->trampolines_id;
                $rentalStart = Carbon::parse($trampoline->rental_start)->format('Y-m-d');
                $rentalEnd = Carbon::parse($trampoline->rental_end)->format('Y-m-d');
                $orderId = $order->id;

                $overlappingRentals = self::checkOverlappingRentals($trampolineId, $rentalStart, $rentalEnd, $orderId);
                if ($overlappingRentals) break;
            }
        }

        if ($overlappingRentals) {
            return [
                'status' => false,
                'message' => 'Dienos, kurias pasirinkote jau yra rezervuotos. Atsiprašome už nesklandumus.'
            ];
        }
        return ['status' => true];
    }

    private static function checkOverlappingRentals($trampolineId, $rentalStart, $rentalEnd, $orderId)
    {
        return DB::table('orders_trampolines')
            ->where('trampolines_id', $trampolineId)
            ->where('is_active', 1)
            ->when($orderId, function ($query, $orderId) {
                return $query->where('orders_id', '!=', $orderId);
            })
            ->where(function ($query) use ($rentalStart, $rentalEnd) {
                $query->where(function ($query) use ($rentalStart) {
                    $query->where('rental_start', '<=', $rentalStart)
                        ->where('rental_end', '>', $rentalStart)
                        ->where('rental_end', '!=', DB::raw("DATE_ADD('$rentalStart', INTERVAL 0 SECOND)"));
                })->orWhere(function ($query) use ($rentalEnd) {
                    $query->where('rental_start', '<', $rentalEnd)
                        ->where('rental_end', '>=', $rentalEnd)
                        ->where('rental_start', '!=', DB::raw("DATE_ADD('$rentalEnd', INTERVAL 0 SECOND)"));
                })->orWhere(function ($query) use ($rentalStart, $rentalEnd) {
                    $query->where('rental_start', '>=', $rentalStart)
                        ->where('rental_end', '<=', $rentalEnd);
                });
            })
            ->exists();
    }

    public static function calculateAdvanceSum($totalSum): float
    {
        $advancePercentage = config('trampolines.advance_percentage');
        $advancePayment = $totalSum * $advancePercentage;
        return round($advancePayment, -1);
    }

    public function deleteInactive(): static
    {
        try {
            $statuses = ['Atšauktas, nes neapmokėtas', 'Atšauktas kliento'];
            $now = Carbon::now();

            $orders = \App\Models\Order::where(function ($query) use ($now) {
                $query->whereHas('trampolines', function ($query) use ($now) {
                    $query->where('rental_end', '<', $now);
                });
            })->orWhereIn('order_status', $statuses)
                ->get();

//            dd($orders);

            if ($orders->isEmpty()) {
                $this->status = true;
                $this->Messages[] = ('Pasibaigusių/atšauktų užsakymų nerasta.');
                return $this;
            }

            foreach ($orders as $order) {
                $order->trampolines()->delete();
                $order->paymentCreationLog()->delete();
                $order->paymentWebhooksLog()->delete();
                $order->delete();
            }

            $this->status = true;
            $this->Messages[] = 'Neaktyvūs užsakymai ištrinti !';
        } catch (\Exception $exception) {
            $this->Errors[] = 'Trinant užsakymą įvyko klaida : ' . $exception->getMessage();
            $this->status = false;
        }

        return $this;
    }

    public function cancelOrder($orderID, $isFromWebhook = false): static
    {
        $order = \App\Models\Order::find($orderID);
        $orderTrampolines = OrdersTrampoline::where('orders_id', $orderID)->get();

        if (!$order) {
            Log::info('Order not found');
            $this->status = false;
            $this->failedInputs->add('error', 'Order not found.');
            return $this;
        }

        if (!$isFromWebhook) {
            $order->update(['order_status' => 'Atšauktas kliento']);
            if (config('mail.send_email') === true) {
                Mail::to($order->client->email)->send(new OrderDeleted($order));
                Mail::to(config('mail.admin_email'))->send(new adminOrderCancelled($order));
            }
        } else {
            $order->update(['order_status' => 'Atšauktas, nes neapmokėtas']);
            if (config('mail.send_email') === true) {
                Mail::to($order->client->email)->send(new OrderNotPaid($order));
            }
        }

        foreach ($orderTrampolines as $orderTrampoline) {
            $orderTrampoline->update(['is_active' => 0]);
        }

        $this->status = true;
        $this->Messages[] = 'Užsakymas atšauktas sėkmingai !';
        return $this;
    }

    public function updateOrderStatus($orderId, $status): array
    {
        $order = \App\Models\Order::find($orderId);
        Log::info('Order in order status' . $order);
        if (!$order) {
            return [
                'status' => false,
                'message' => 'Order not found.'
            ];
        }

        switch ($status) {
            case 'PAID':
                $order->update(['order_status' => 'Apmokėtas']);
                if (config('mail.send_email') === true) {
                    Mail::to($order->client->email)->send(new OrderPaid($order));
                    Mail::to(config('mail.admin_email'))->send(new AdminPaidOrder($order));
                }
                break;
            case 'ABANDONED':
                $order->update(['order_status' => 'Atšauktas, nes neapmokėtas']);
                if (config('mail.send_email') === true) {
                    Mail::to($order->client->email)->send(new OrderNotPaid($order));
                    Mail::to(config('mail.admin_email'))->send(new adminOrderCancelled($order));
                }
                break;
        }

        return [
            'status' => true,
            'message' => 'Order status updated.'
        ];
    }

    public function updateOrderActivity($orderId, $status): array
    {
        $order = \App\Models\Order::find($orderId);
        if (!$order) {
            return [
                'status' => false,
                'message' => 'Order not found.'
            ];
        }
        $orderTrampolines = OrdersTrampoline::where('orders_id', $orderId)->get();
        switch ($status) {
            case 'ABANDONED':
                foreach ($orderTrampolines as $orderTrampoline) {
                    $orderTrampoline->update(['is_active' => 0]);
                }
                return [
                    'status' => true,
                    'message' => 'Order activity updated successfully.'
                ];
            case 'PAID':
                foreach ($orderTrampolines as $orderTrampoline) {
                    $orderTrampoline->update(['is_active' => 1]);
                }
                return [
                    'status' => true,
                    'message' => 'Order activity updated successfully.'
                ];
        }
        return [
            'status' => false,
            'message' => 'Invalid status.'
        ];
    }

    public function getOrderStatus($orderId): array
    {
        $order = \App\Models\Order::find($orderId);
        if (!$order) {
            return [
                'status' => false,
                'message' => 'Order not found.'
            ];
        }
        return [
            'status' => true,
            'orderStatus' => $order->order_status
        ];
    }

    public function updateDeliveryTime($Request): array
    {
        $orderID = $Request->input('orderID');
        $order = \App\Models\Order::find($orderID);
        $customerDeliveryTime = $Request->input('customerDeliveryTime');


        $affectedRows = OrdersTrampoline::where('orders_id', $orderID)->update(['delivery_time' => $customerDeliveryTime]);
        if ($affectedRows > 0 && config('mail.send_email') === true) {
            Mail::to($order->client->email)->send(new orderUpdated($order));
            Mail::to(config('mail.admin_email'))->send(new adminOrderUpdated($order));
        }
        if ($affectedRows > 0) {
            return [
                'status' => true,
                'message' => 'Delivery time updated successfully.',
                'deliveryTime' => $customerDeliveryTime,
                'view' => \view('orders.public.order_info', [
                    'Order' => (new \App\Models\Order())->newQuery()->with('trampolines')->with('client')
                        ->with('address')->find($order->id),
                ])->render()
            ];
        } else {
            return [
                'status' => false,
                'failedInputs' => 'Failed to update delivery time.'
            ];
        }

    }

    public function initializeUpdateCalendar($orderID): array
    {
        $order = \App\Models\Order::find($orderID);
        $orderActive = $order->trampolines()->where('is_active', 1)->exists();
        $orderRentalStart = Carbon::parse($order->trampolines()->pluck('rental_start')->first())->format('Y-m-d');
        if (!$orderActive) {
            return [
                'status' => false,
                'message' => 'Užsakymas neaktyvus, redaguoti negalima.'
            ];
        } else if ($order->order_status === 'Neapmokėtas') {
            return [
                'status' => false,
                'message' => 'Užsakymo redaguoti negalima, nes jis neapmokėtas.'
            ];
        } else if ($orderRentalStart < Carbon::now()->format('Y-m-d')) {
            return [
                'status' => false,
                'message' => 'Užsakymo redaguoti negalima, nes praėjo rezervacijos pradžios data.'
            ];
        }
        $rentalStart = $order->trampolines()->pluck('rental_start')->first();
        return [
            'status' => true,
            'rentalStart' => $rentalStart
        ];
    }

    public function sendAdditionalEmail($Request): array
    {
        if ((config('mail.send_email') === false)) {
            return [
                'status' => false,
                'message' => 'El. pašto siuntimas išjungtas.'
            ];
        }
        $order = \App\Models\Order::find($Request->input('orderID'));
        $email = $Request->input('customerEmail');
        switch ($Request->input('emailType')) {
            case 'OrderPaid':
                if ($order->order_status !== 'Apmokėtas') {
                    return [
                        'status' => false,
                        'message' => 'El. pašto siųsti negalima, nes užsakymas neapmokėtas arba atšauktas !'
                    ];
                } else {
                    Mail::to($email)->send(new OrderPaid($order));
                }
                break;
            case 'OrderPlaced':
                if ($order->trampolines()->where('is_active', 0)->exists()){
                    return [
                        'status' => false,
                        'message' => 'El. pašto siųsti negalima, nes užsakymas neaktyvus !'
                    ];
                } else {
                    Mail::to($email)->send(new OrderPlaced(
                        $order,
                        (new MontonioPaymentsService())->retrievePaymentLink($Request->input('orderID'))
                    ));
                }
                break;
            case 'OrderNotPaid':
                if ($order->order_status !== 'Atšauktas, nes neapmokėtas') {
                    return [
                        'status' => false,
                        'message' => 'El. pašto siųsti negalima, nes užsakymas apmokėtas arba laukia apmokėjimo !'
                    ];
                } else {
                    Mail::to($email)->send(new OrderNotPaid($order));
                }
                break;
            case 'OrderCancelled':
                if ($order->trampolines()->where('is_active', '!=', 0)->exists()) {
                    return [
                        'status' => false,
                        'message' => 'El. pašto siųsti negalima, nes užsakymas aktyvus ! Turi atšaukti arba klientas arba adminas.'
                    ];
                } else {
                    Mail::to($email)->send(new OrderDeleted($order));
                }
                break;
        }
        return [
            'status' => true,
            'message' => 'El. laiškas išsiųstas.'
        ];
    }
}
