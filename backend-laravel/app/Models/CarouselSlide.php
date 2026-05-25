<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarouselSlide extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'image_url',
        'cta_text',
        'cta_url',
        'position',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
