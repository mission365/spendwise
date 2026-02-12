<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'limit',
    ];

    protected $casts = [
        'limit' => 'float',
    ];

    // Get the single budget instance (there's only one row)
    public static function getInstance()
    {
        return static::firstOrCreate(['id' => 1], ['limit' => 2000]);
    }
}
