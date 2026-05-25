<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'price_monthly',
        'price_annual',
        'available',
        'popular',
        'order',
    ];

    protected $casts = [
        'available' => 'boolean',
        'popular'   => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_annual'  => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category', 'name');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
