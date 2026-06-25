<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'name_en',
        'slug',
        'description',
        'description_en',
        'features',
        'features_en',
        'images',
        'price_monthly',
        'price_annual',
        'status',
        'priority',
        'max_capacity',
    ];

    protected $casts = [
        'features'      => 'array',
        'features_en'   => 'array',
        'images'        => 'array',
        'price_monthly' => 'decimal:2',
        'price_annual'  => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
}
