<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Trampoline extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description'
    ];

    public function Parameter(): HasOne
    {
        return $this->hasOne(Parameter::class, 'trampolines_id');
    }

    public array $FieldRelationsToColumns = [
        2 => 'parameters.activity',
        4 => 'parameters.height',
        5 => 'parameters.width',
        6 => 'parameters.length',
        7 => 'parameters.price',
    ];

    public function getField($ColumnNumber)
    {
        try {
            return $this->FieldRelationsToColumns[$ColumnNumber];
        } catch (\Exception $exception) {
            return null;
        }
    }

}
