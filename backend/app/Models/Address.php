<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'address1',
        'address2', 'city', 'region', 'postal_code',
        'country', 'phone_number',
    ];

    public function user() { return $this->belongsTo(User::class); }
}