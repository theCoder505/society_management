<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flat extends Model
{
    protected $fillable = [
        'appartment_uid',
        'flatID',
        'owner_uid',       // used for availability checks
        'flat_type',
        'tenant_uid',
        'flat_price',
        'flat_size',
        'flat_bhk',
        'tot_bedrooms',
        'tot_washrooms',
        'tot_balconies',
        'drawing_dyning_kitchen',
        'flat_images',
        'flat_3d_video',
        'rent_price',
        'bought_at',
        'wifi',
        'dish',
        'gas',
        'intercom',
        'lift',
        'note',
    ];
}