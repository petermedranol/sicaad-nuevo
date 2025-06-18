<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type_id',
        'campus',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user type
     */
    public function userType(): BelongsTo
    {
        return $this->belongsTo(UserType::class);
    }

    /**
     * Get menu accesses for this user
     */
    public function menuAccesses(): HasMany
    {
        return $this->hasMany(UserMenuAccess::class);
    }

    /**
     * Get menus this user has access to
     */
    public function accessibleMenus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'user_menu_accesses')
                    ->withPivot(['access_level', 'is_active'])
                    ->withTimestamps();
    }

    /**
     * Get all menus available to this user (free + restricted with access)
     */
    public function getAvailableMenusAttribute()
    {
        // Free menus for user type
        $freeMenus = Menu::active()->free();
        
        if ($this->user_type_id) {
            $freeMenus = $freeMenus->where(function($query) {
                $query->whereNull('user_type_id')
                      ->orWhere('user_type_id', $this->user_type_id);
            });
        } else {
            $freeMenus = $freeMenus->whereNull('user_type_id');
        }
        
        // Restricted menus with explicit access
        $restrictedMenuIds = $this->menuAccesses()
                                 ->active()
                                 ->pluck('menu_id')
                                 ->toArray();
        
        $restrictedMenus = Menu::active()
                              ->restricted()
                              ->whereIn('id', $restrictedMenuIds);
        
        return $freeMenus->union($restrictedMenus)
                        ->root()
                        ->ordered()
                        ->with(['children' => function($query) {
                            $query->active()->ordered();
                        }])
                        ->get();
    }

    /**
     * Check if user has access to a specific menu
     */
    public function hasMenuAccess(int $menuId): bool
    {
        $menu = Menu::find($menuId);
        
        if (!$menu || !$menu->is_active) {
            return false;
        }
        
        // Check if menu is free
        if ($menu->is_free) {
            // If menu is for all user types or matches user's type
            return !$menu->user_type_id || $menu->user_type_id === $this->user_type_id;
        }
        
        // Check restricted access
        return $this->menuAccesses()
                   ->active()
                   ->where('menu_id', $menuId)
                   ->exists();
    }

    /**
     * Get user's access level for a specific menu
     */
    public function getMenuAccessLevel(int $menuId): ?string
    {
        $access = $this->menuAccesses()
                      ->active()
                      ->where('menu_id', $menuId)
                      ->first();
        
        return $access?->access_level;
    }

    /**
     * Scope to get only active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by campus
     */
    public function scopeByCampus($query, string $campus)
    {
        return $query->where('campus', $campus);
    }
}
