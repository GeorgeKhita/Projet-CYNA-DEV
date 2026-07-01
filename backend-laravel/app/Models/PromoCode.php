<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromoCode extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_ht',
        'max_uses',
        'uses_count',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value'        => 'decimal:2',
        'min_order_ht' => 'decimal:2',
        'max_uses'     => 'integer',
        'uses_count'   => 'integer',
        'expires_at'   => 'datetime',
        'is_active'    => 'boolean',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isValid(?float $orderHt = null): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses !== null && $this->uses_count >= $this->max_uses) return false;
        if ($this->min_order_ht !== null && $orderHt !== null && $orderHt < (float) $this->min_order_ht) return false;

        return true;
    }

    public function computeDiscount(float $orderHt): float
    {
        if ($this->type === 'percent') {
            return round($orderHt * ((float) $this->value / 100), 2);
        }

        return min(round((float) $this->value, 2), $orderHt);
    }
}
