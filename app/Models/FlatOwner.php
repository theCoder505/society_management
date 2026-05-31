<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class FlatOwner extends Authenticatable
{
    use Notifiable;

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
        'profile_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];
}