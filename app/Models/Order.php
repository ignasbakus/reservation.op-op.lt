<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'order_date',
        'rental_duration',
        'delivery_address_id',
        'advance_sum',
        'advance_status',
        'total_sum',
        'client_id'
    ];

    public function trampolines(): HasMany
    {
        return $this->hasMany(OrdersTrampoline::class,'orders_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(ClientAddress::class, 'delivery_address_id');
    }
    /*hasOne -> client*/
    /*hasOne -> client_address*/

}
