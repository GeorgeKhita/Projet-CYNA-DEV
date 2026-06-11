<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarouselSlide extends Model
{
    use HasFactory;

    protected $table = 'homepage_carousel';

    protected $fillable = [
        'product_id',
        'image_url',
        'title',
        'subtitle',
        'cta_text',
        'link',
        'display_order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
