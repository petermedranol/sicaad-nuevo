<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Menu extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'icon',
        'date_created',
        'link',
        'description',
        'order',
        'is_free',
        'user_type_id',
        'is_active',
    ];

    protected $casts = [
        'date_created' => 'date',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the parent menu
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    /**
     * Get child menus
     */
    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('order');
    }

    /**
     * Get the user type this menu belongs to (if applicable)
     */
    public function userType(): BelongsTo
    {
        return $this->belongsTo(UserType::class);
    }

    /**
     * Get users that have access to this menu
     */
    public function usersWithAccess(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_menu_accesses')
                    ->withPivot(['access_level', 'is_active'])
                    ->withTimestamps();
    }

    /**
     * Get access records for this menu
     */
    public function accesses(): HasMany
    {
        return $this->hasMany(UserMenuAccess::class);
    }

    /**
     * Scope to get only active menus
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only free menus
     */
    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    /**
     * Scope to get only restricted menus
     */
    public function scopeRestricted($query)
    {
        return $query->where('is_free', false);
    }

    /**
     * Scope to get root menus (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get menus ordered by order field
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
