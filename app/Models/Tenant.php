<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'tenant_uid',
        'name',
        'hometown',
        'permanent_addr',
        'contact',
        'email',
        'otp',
        'password',
        'image',
        'nid_front',
        'nid_back',
        'renting_flats',           // JSON array: ['FLAT_A1','FLAT_A2']
        'starting_rent_amount',    // JSON object: { FLAT_A1: 8000, FLAT_A2: 9000 } — auto-populated, view only
        'current_rent_amount',     // JSON object: { FLAT_A1: 8500 } — editable
        'family_members',
        'renting_since',
        'notes',
    ];

    
    protected $casts = [
        'renting_flats'         => 'array',
        'starting_rent_amount'  => 'array',
        'current_rent_amount'   => 'array',
        'renting_since'         => 'date',
    ];
}