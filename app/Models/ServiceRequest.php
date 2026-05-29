<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    protected $fillable = [
        'service_uid',
        'from_tenant_uid',
        'to_owner_uid',
        'title',
        'requet_details',
        'approve_status',
    ];
}
