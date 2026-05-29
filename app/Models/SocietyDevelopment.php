<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocietyDevelopment extends Model
{
    protected $fillable = [
        'development_uid',
        'title',
        'details',
    ];
}
