<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'two_factor_enabled',
        'is_email_verified',
    ];

    protected $hidden = [
        'password',
    ];

    public function addresses() { return $this->hasMany(Address::class); }
    public function orders() { return $this->hasMany(Order::class); }
    public function subscriptions() { return $this->hasMany(Subscription::class); }
    public function paymentMethods() { return $this->hasMany(PaymentMethod::class); }
    public function cart() { return $this->hasOne(Cart::class); }
}