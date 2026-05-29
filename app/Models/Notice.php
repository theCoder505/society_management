<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    protected $fillable = [
        'notice_uid',
        'from_owner_uid',
        'to_tenant_uid',
        'title',
        'notice_details',
        'is_complied',
        'complied_at',
    ];
}
