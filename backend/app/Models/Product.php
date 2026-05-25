<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'description',
        'features', 'images', 'price_monthly',
        'price_annual', 'status', 'priority',
    ];

    protected $casts = [
        'features' => 'array',
        'images' => 'array',
    ];

    public function category() { return $this->belongsTo(Category::class); }
    public function orderDetails() { return $this->hasMany(OrderDetail::class); }
    public function subscriptions() { return $this->hasMany(Subscription::class); }
}