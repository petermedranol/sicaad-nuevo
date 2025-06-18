<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMenuAccess extends Model
{
    protected $fillable = [
        'user_id',
        'menu_id',
        'access_level',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Access level constants
     */
    public const ACCESS_CAPTURISTA = 'capturista';
    public const ACCESS_ADMINISTRATOR = 'administrator';
    public const ACCESS_SUPER_ADMIN = 'super_admin';

    /**
     * Get available access levels
     */
    public static function getAccessLevels(): array
    {
        return [
            self::ACCESS_CAPTURISTA => 'Capturista',
            self::ACCESS_ADMINISTRATOR => 'Administrator',
            self::ACCESS_SUPER_ADMIN => 'Super Admin',
        ];
    }

    /**
     * Get the user that has this access
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the menu this access is for
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Scope to get only active accesses
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by access level
     */
    public function scopeByAccessLevel($query, string $level)
    {
        return $query->where('access_level', $level);
    }

    /**
     * Check if user has admin or super admin access
     */
    public function isAdminLevel(): bool
    {
        return in_array($this->access_level, [self::ACCESS_ADMINISTRATOR, self::ACCESS_SUPER_ADMIN]);
    }

    /**
     * Check if user has super admin access
     */
    public function isSuperAdmin(): bool
    {
        return $this->access_level === self::ACCESS_SUPER_ADMIN;
    }
}
