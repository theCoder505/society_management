<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlatOwnerCost extends Model
{
    protected $fillable = [
        'cost_uid',
        'owner_uid',
        'amount',
        'cost_type',
        'development_uid',
    ];
}
