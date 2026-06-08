<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'address_id',
        'payment_method_id',
        'stripe_pi_id',
        'status',
        'subtotal',
        'tax',
        'total',
        'invoice_path',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax'      => 'decimal:2',
        'total'    => 'decimal:2',
    ];

    public function user()        { return $this->belongsTo(User::class); }
    public function details()     { return $this->hasMany(OrderDetail::class); }
    public function subscriptions(){ return $this->hasMany(Subscription::class); }
}
