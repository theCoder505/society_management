<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantBill extends Model
{
    protected $fillable = [
        'transaction_id',
        'tenant_uid',
        'amount',
        'payment_method',
        'bill_type',
        'sent_money_to',
        'note',
    ];
}
