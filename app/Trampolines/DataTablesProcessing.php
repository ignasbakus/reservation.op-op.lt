<?php

namespace App\Trampolines;

use App\Models\Client;
use App\Models\ClientAddress;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Parameter;
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

    public function getPaginatedData(Model $model, array $Relations, int $Length, int $Start, array $Ordering = [],): static
    {
        $this->TableName = $model->getTable();
        $Query = $model->newQuery();
        if (count($Relations) > 0) {
            $Query->with($Relations);
        }
        $Query->select([$model->getTable() . '.*']);
        switch ($model->getTable()) {
            case 'trampolines' :
                $Query->leftJoin((new Parameter())->getTable(), (new Parameter())->getTable() . '.trampolines_id', '=', 'trampolines.id');
                break;
            case 'orders' :
                //$Query->leftJoin((new OrdersTrampoline())->getTable(), (new OrdersTrampoline())->getTable() . 'orders_id', '=', 'orders.id');
                //$Query->leftJoin((new Client())->getTable(), (new Client())->getTable() . 'id', '=', 'orders.client_id');
                //$Query->leftJoin((new ClientAddress())->getTable(), (new ClientAddress())->getTable() . 'id', '=', 'orders.delivery_address_id');
                break;
        }
        try {
            foreach ($Ordering as $Order) {
                $Query->orderBy($model->getField($Order['column']), $Order['dir']);
            }
        } catch (\Exception $exception) {
        }
        $Query->offset($Start)->limit($Length);
        $this->List = $Query->get();
        $this->recordsTotal = $model->newQuery()->count();
        $this->recordsFiltered = $this->recordsTotal;
        self::generateTableRows();
        return $this;
    }

    private function generateTableRows(): void
    {
        foreach ($this->List as $CollectionItem) {
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
                        '
                  <button data-trampolineid="' . $CollectionItem->id . '" class="btn trampolinePicture">
                    <svg width="20" height="20" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path>
                        <path d= "M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"></path>
                    </svg>
                  </button>
                  <button data-trampolineid="' . $CollectionItem->id . '" class="btn trampolineUpdate">
                    <svg width="20" height="20" fill="#0066cc" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"></path>
                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"></path>
                    </svg>
                  </button>
                  <button data-trampolineid="' . $CollectionItem->id . '" class="btn trampolineDelete">
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
                    foreach ($CollectionItem->trampolines as $Trampoline) {
                        $TrampolineNames .= 'Batutas ' . $Trampoline->trampoline->title . '<br>';
                    }


                    $ROW = [
                        $CollectionItem->id,
                        $CollectionItem->order_date,
                        $TrampolineNames,
                        $CollectionItem->client->name . ' <br> ' . $CollectionItem->client->surname,
                        $CollectionItem->client->email,
                        $CollectionItem->client->phone,
                        $CollectionItem->address->address_street . '<br>' . $CollectionItem->address->address_town . ' <br> ' . $CollectionItem->address->address_postcode,
                        $CollectionItem->rental_duration,
                        $CollectionItem->total_sum . ' ' . config('trampolines.currency', '€'),
                        $CollectionItem->advance_sum . ' ' . config('trampolines.currency', '€'),
                        $CollectionItem->order_status,
                        '
                  <button data-orderid="' . $CollectionItem->id . '" class="btn orderShow">
                    <svg width="20" height="20" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"></path>
                        <path d= "M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"></path>
                    </svg>
                  </button>
                  <button data-orderid="' . $CollectionItem->id . '" class="btn orderUpdate">
                    <svg width="20" height="20" fill="#0066cc" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"></path>
                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"></path>
                    </svg>
                  </button>
                  <button data-orderid="' . $CollectionItem->id . '" class="btn orderDelete">
                    <svg width="20" height="20" fill="red" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"></path>
                    </svg>
                  </button>
                '
                    ];
                    $this->data[] = $ROW;
                    break;
            }
        }
    }
}
