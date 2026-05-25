<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'order_id', 'stripe_sub_id',
        'status', 'billing_cycle', 'current_period_start',
        'current_period_end', 'cancelled_at',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function product() { return $this->belongsTo(Product::class); }
    public function order() { return $this->belongsTo(Order::class); }
}