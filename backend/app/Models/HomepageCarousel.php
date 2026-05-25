<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageCarousel extends Model
{
    protected $fillable = ['product_id', 'image_url', 'title', 'link', 'display_order'];

    public function product() { return $this->belongsTo(Product::class); }
}