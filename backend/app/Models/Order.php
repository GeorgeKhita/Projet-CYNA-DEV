<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'address_id', 'payment_method_id',
        'stripe_pi_id', 'status', 'subtotal', 'tax',
        'total', 'invoice_path',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function address() { return $this->belongsTo(Address::class); }
    public function paymentMethod() { return $this->belongsTo(PaymentMethod::class); }
    public function orderDetails() { return $this->hasMany(OrderDetail::class); }
    public function subscription() { return $this->hasOne(Subscription::class); }
}