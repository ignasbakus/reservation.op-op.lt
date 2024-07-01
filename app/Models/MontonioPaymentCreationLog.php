<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MontonioPaymentCreationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'client_id',
        'payload',
        'payment_creation_response'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
