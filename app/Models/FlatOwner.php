<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlatOwner extends Model
{
    protected $fillable = [
        'owner_uid',
        'name',
        'image',
        'nid_front_page',
        'nid_back_page',
        'hometown',
        'permanent_addr',
        'contact_number',
        'email',
        'password',
        'otp',
        'appartments',
        'flats',
    ];
}