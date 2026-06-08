<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'email',
        'subject',
        'message_body',
        'requires_human',
        'status',
    ];

    protected $casts = [
        'requires_human' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
