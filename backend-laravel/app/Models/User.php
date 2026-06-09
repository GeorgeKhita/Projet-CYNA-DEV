<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'company',
        'role',
        'is_active',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_confirmed_at',
        'is_email_verified',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
    ];

    protected $casts = [
        'password'                => 'hashed',
        'two_factor_enabled'      => 'boolean',
        'two_factor_confirmed_at' => 'datetime',
        'is_email_verified'       => 'boolean',
        'is_active'               => 'boolean',
    ];

    /**
     * Vérifie si l'utilisateur est admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function supportMessages()
    {
        return $this->hasMany(SupportMessage::class);
    }

    public function securityLogs()
    {
        return $this->hasMany(SecurityLog::class);
    }

    /**
     * Nom complet
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
