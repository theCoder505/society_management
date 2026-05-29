<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appartment extends Model
{
    protected $fillable = [
        'appartment_uid',
        'appartment_name',
        'appartment_location',
        'total_flats',
        'total_units',
        'total_lifts',
        'doors_open_time',
        'doors_close_time',
        'total_gas_lines',
        'gas_systen',
        'water_systen',
        'water_in_time',
        'water_out_time',
        'garage_location',
        'garage_size',
        'garage_allocation',
        'garage_sections', // array
        'total_electricity_lines',
        'tot_solar_panels',
        'terrace_option',
        'apartment_images', // array
        'apartment_notes',
    ];
}
