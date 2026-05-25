<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'user_id', 'cardholder_name', 'last_four_digits',
        'expiry_date', 'payment_token', 'is_default',
    ];

    public function user() { return $this->belongsTo(User::class); }
}