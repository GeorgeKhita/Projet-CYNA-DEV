<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'detail',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper statique pour enregistrer rapidement un log
     */
    public static function record(int $userId, string $action, string $detail = '', string $ip = ''): self
    {
        return static::create([
            'user_id'    => $userId,
            'action'     => $action,
            'detail'     => $detail,
            'ip_address' => $ip,
            'created_at' => now(),
        ]);
    }
}
