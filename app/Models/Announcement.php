<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'person_type', // owner or tenant
        'announcement_for_uid', // owner_uid or tenant_uid
        'title',
        'details',
    ];
}
