<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = [
        'brand_name',
        'brand_logo',
        'brand_icon',
        'location',
        'gogle_map',
        'facebook',
        'instagram',
        'twitter',
        'linkedin',
        'contact_email',
        'about',
        'privacy_policy',
        'terms_conditions',
    ];
}
