<?php

namespace App\Trampolines;

use App\Models\Client;
use App\Models\ClientAddress;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Parameter;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class DataTablesProcessing
{

    public Collection $List;

    public int $recordsTotal;

    public int $recordsFiltered;

    public array $data;

    private string $TableName;

    public function getPaginatedData(
        Model $model,
        array $Relations,
        int   $Length,
        int   $Start,
        array $Ordering = [],
              $startDate = null,
              $endDate = null,
              $searchValue = null,
              $filterActive = null,
              $filterInactive = null
    ): static
    {
        $this->TableName = $model->getTable();
        $Query = $model->newQuery();

        if (count($Relations) > 0) {
            $Query->with($Relations);
        }

        // Conditionally select fields based on the model's table
        $fieldsToSelect = [$model->getTable() . '.*'];
        if ($this->TableName === 'orders') {
            $fieldsToSelect[] = 'order_date';
            $fieldsToSelect[] = 'orders_trampolines.rental_start';
        } elseif ($this->TableName === 'trampolines') {
            $fieldsToSelect[] = 'parameters.activity';
            $fieldsToSelect[] = 'parameters.height';
            $fieldsToSelect[] = 'parameters.width';
            $fieldsToSelect[] = 'parameters.length';
            $fieldsToSelect[] = 'parameters.price';
        }
        $Query->select($fieldsToSelect);
//        dd($Query->select($fieldsToSelect));


        if ($startDate && $endDate) {
            $startDate = Carbon::parse($startDate)->startOfDay();
            $endDate = Carbon::parse($endDate)->endOfDay();
            if ($this->TableName === 'orders') {
                $Query->whereHas('trampolines', function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('rental_start', [$startDate, $endDate]);
                });
            }
        }

        if ($searchValue) {
            if ($this->TableName === 'orders') {
                $Query->where(function ($query) use ($searchValue) {
                    // Search within the 'client' relationship
                    $query->whereHas('client', function ($query) use ($searchValue) {
                        $query->whereRaw("CONCAT(name, ' ', surname) LIKE ?", ["%{$searchValue}%"])
                            ->orWhere('email', 'like', '%' . $searchValue . '%')
                            ->orWhere('phone', 'like', '%' . $searchValue . '%');
                    })
                        // Search within the 'address' relationship (client_addresses)
                        ->orWhereHas('address', function ($query) use ($searchValue) {
                            $query->where('address_town', 'like', '%' . $searchValue . '%');
                        })
                        // Search within the 'orders' table
                        ->orWhere('order_number', 'like', '%' . $searchValue . '%');
                });
            }
        }


        if ($filterActive && !$filterInactive) {
            $Query->whereHas('parameter', function ($query) {
                $query->where('activity', 1);
            });
        } elseif (!$filterActive && $filterInactive) {
            $Query->whereHas('parameter', function ($query) {
                $query->where('activity', 0);
            });
        }


        // Handle joins based on the model's table
        switch ($this->TableName) {
            case 'trampolines':
                $Query->leftJoin(
                    (new Parameter())->getTable(),
                    (new Parameter())->getTable() . '.trampolines_id',
                    '=',
                    'trampolines.id'
                );
                break;
            case 'orders':
                $Query->leftJoin(
                    (new OrdersTrampoline())->getTable(),
                    (new OrdersTrampoline())->getTable() . '.orders_id',
                    '=',
                    'orders.id'
                );
                break;
        }

        // Handle ordering
        try {
            foreach ($Ordering as $Order) {
                $field = $model->getField($Order['column']);
                if ($field) {
                    $Query->orderBy($field, $Order['dir']);
                }
            }
        } catch (\Exception $exception) {
            // Handle exception if needed
        }

        // Using distinct to avoid duplicate entries
        $Query->distinct();
        $Query->offset($Start)->limit($Length);
//        dd($Query->offset($Start)->limit($Length));

        $this->List = $Query->get();

        $this->recordsTotal = $model->newQuery()->count();
        $this->recordsFiltered = $this->recordsTotal;

        if ($this->List->isEmpty()) {
            $this->data = [];
        } else {
            self::generateTableRows();
        }
        return $this;
    }


    private function generateTableRows(): void
    {
        foreach ($this->List as $CollectionItem) {
//            dd($CollectionItem);
            switch ($this->TableName) {
                case 'trampolines' :
                    $Parameters = Parameter::where('trampolines_id', $CollectionItem->id)->get();
                    $Activity = '';
                    $Color = '';
                    $Height = '';
                    $Width = '';
                    $Length = '';
                    $Price = '';
                    foreach ($Parameters as $item) {
                        $Color = $item->color;
                        $Height = $item->height;
                        $Width = $item->width;
                        $Length = $item->length;
                        $Price = $item->price;
                        $Activity = $item->activity;
                    }

                    $ROW = [
                        $CollectionItem->title,
                        $CollectionItem->description,
                        $Activity,
                        $Color,
                        $Height,
                        $Width,
                        $Length,
                        $Price . ' ' . config('trampolines.currency', '€'),
                        /*'
                  <button data-trampolineid="' . $CollectionItem->id . '" class="btn trampolinePicture">
                    <svg width="20" height="20" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path>
                        <path d= "M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"></path>
                    </svg>
                  </button>
                        ',*/
                        '
                  <button data-trampolineid="' . $CollectionItem->id . '" id="trampolineUpdate" class="btn trampolineUpdate">
                    <svg width="20" height="20" fill="#0066cc" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"></path>
                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"></path>
                    </svg>
                  </button>
                  <button data-trampolineid="' . $CollectionItem->id . '" id="trampolineDelete" class="btn trampolineDelete">
                    <svg width="20" height="20" fill="red" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"></path>
                    </svg>
                  </button>
                '
                    ];
                    $this->data[] = $ROW;
                    break;
                case 'orders' :
                    $TrampolineNames = '';
                    $RentalStart = '';
                    $RentalEnd = '';
                    $DeliveryTime = '';
                    if ($CollectionItem->Trampolines->isNotEmpty()) {
                        $RentalStart = $CollectionItem->Trampolines->first()->rental_start;
                        $RentalEnd = Carbon::parse($CollectionItem->Trampolines->first()->rental_end)->subDay()->toDateString();
                        $DeliveryTime = $CollectionItem->Trampolines->first()->delivery_time;

                        foreach ($CollectionItem->Trampolines as $Trampoline) {
                            if (isset($Trampoline->trampoline->title) && $Trampoline) {
                                $TrampolineNames .= 'Batutas ' . $Trampoline->trampoline->title . '<br>';
                            } else {
                                $TrampolineNames .= 'Batutas nebeegzistuoja!<br>';
                            }
                        }
                    }

                    $ROW = [
                        $CollectionItem->order_number,
                        $CollectionItem->order_date,
                        $TrampolineNames,
                        $RentalStart . '<br>' . $RentalEnd,
                        $DeliveryTime,
                        $CollectionItem->client->name . ' <br> ' . $CollectionItem->client->surname,
                        $CollectionItem->client->email . '<br>' . $CollectionItem->client->phone,
//                        $CollectionItem->client->phone,
                        $CollectionItem->address->address_street . '<br>' . $CollectionItem->address->address_town . ' <br> ' . $CollectionItem->address->address_postcode,
                        $CollectionItem->rental_duration,
                        $CollectionItem->total_sum . ' ' . config('trampolines.currency', '€'),
                        $CollectionItem->advance_sum . ' ' . config('trampolines.currency', '€'),
                        $CollectionItem->order_status,
                        '
                  <button data-orderid="' . $CollectionItem->id . '" id="checkOrderStatus" class="btn checkOrderStatus">
                    <svg width="20" height="20" fill="green" class="bi bi-check-lg" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"></path>
                    </svg>
                  </button>
                  <button data-orderid="' . $CollectionItem->id . '" id="orderUpdate" class="btn orderUpdate">
                    <svg width="20" height="20" fill="#0066cc" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"></path>
                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"></path>
                    </svg>
                  </button>
                  <button data-orderid="' . $CollectionItem->id . '" id="sendMail" class="btn sendMail">
                    <svg width="20" height="20" fill="grey" class="bi bi-envelope" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"></path>
                    </svg>
                  </button>
                  <button data-orderid="' . $CollectionItem->id . '" data-ordernumber="' . $CollectionItem->order_number . '" id="orderDelete" class="btn orderDelete">
                    <svg width="20" height="20" fill="red" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"></path>
                    </svg>
                  </button>
                  <button type="button" class="btn" id="refundOrder">
                    <svg width="16" height="16" fill="black" class="bi bi-currency-dollar" viewBox="0 0 16 16">
                     <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z"></path>
                    </svg>
                  </button>
                '
                    ];
                    $this->data[] = $ROW;
//                    dd($ROW);
                    break;
            }
        }
    }
}
