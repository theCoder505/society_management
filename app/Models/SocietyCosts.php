<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocietyCosts extends Model
{
    protected $table = 'society_costs';

    protected $fillable = [
        'cost_uid',
        'cost_type',
        'development_uid',
        'amount',
        'payment_method',
        'cost_details',
    ];
}
