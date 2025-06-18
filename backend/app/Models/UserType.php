<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserType extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get users that belong to this user type
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get menus that are specifically for this user type
     */
    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    /**
     * Scope to get only active user types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
