<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdersTrampoline extends Model
{
    use HasFactory;

    protected $fillable = [
        'orders_id',
        'trampolines_id',
        'rental_start',
        'rental_end',
        'rental_duration',
        'total_sum',
    ];
}
