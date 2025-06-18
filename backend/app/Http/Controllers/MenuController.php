<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Menu;
use App\Models\User;

class MenuController extends Controller
{
    /**
     * Get user's available menus for frontend navigation
     */
    public function getUserMenus(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener menús libres para el tipo de usuario
            $freeMenusQuery = Menu::active()->free()->root();
            
            if ($user->user_type_id) {
                $freeMenusQuery->where(function($query) use ($user) {
                    $query->whereNull('user_type_id')
                          ->orWhere('user_type_id', $user->user_type_id);
                });
            } else {
                $freeMenusQuery->whereNull('user_type_id');
            }
            
            $freeMenus = $freeMenusQuery->ordered()->get();

            // Obtener IDs de menús restringidos con acceso
            $restrictedMenuIds = $user->menuAccesses()
                                     ->active()
                                     ->pluck('menu_id')
                                     ->toArray();
            
            // Obtener menús restringidos raíz con acceso
            $restrictedMenus = Menu::active()
                                  ->restricted()
                                  ->root()
                                  ->whereIn('id', $restrictedMenuIds)
                                  ->ordered()
                                  ->get();

            // Combinar menús
            $allMenus = $freeMenus->merge($restrictedMenus)->sortBy('order');

            // Construir estructura jerárquica con hijos
            $menuStructure = $allMenus->map(function($menu) use ($user) {
                return $this->buildMenuStructure($menu, $user);
            })->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'menus' => $menuStructure,
                    'user_info' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'user_type' => $user->userType?->name,
                        'campus' => $user->campus,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener menús del usuario',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Build menu structure recursively including children
     */
    private function buildMenuStructure(Menu $menu, User $user): array
    {
        $menuData = [
            'id' => $menu->id,
            'name' => $menu->name,
            'icon' => $menu->icon,
            'link' => $menu->link,
            'description' => $menu->description,
            'order' => $menu->order,
            'is_free' => $menu->is_free,
            'children' => []
        ];

        // Obtener hijos activos ordenados
        $children = $menu->children()->active()->ordered()->get();
        
        foreach ($children as $child) {
            // Verificar si el usuario tiene acceso al hijo
            if ($this->userHasMenuAccess($child, $user)) {
                $menuData['children'][] = $this->buildMenuStructure($child, $user);
            }
        }

        return $menuData;
    }

    /**
     * Check if user has access to a specific menu
     */
    private function userHasMenuAccess(Menu $menu, User $user): bool
    {
        // Si el menú es libre
        if ($menu->is_free) {
            // Si es para todos los tipos o coincide con el tipo del usuario
            return !$menu->user_type_id || $menu->user_type_id === $user->user_type_id;
        }

        // Si es restringido, verificar acceso explícito
        return $user->menuAccesses()
                   ->active()
                   ->where('menu_id', $menu->id)
                   ->exists();
    }

    /**
     * Get user's access level for a specific menu
     */
    public function getMenuAccessLevel(Request $request, int $menuId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $menu = Menu::find($menuId);
            
            if (!$menu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menú no encontrado'
                ], 404);
            }

            $hasAccess = $this->userHasMenuAccess($menu, $user);
            $accessLevel = null;

            if ($hasAccess && !$menu->is_free) {
                $accessLevel = $user->getMenuAccessLevel($menuId);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'menu_id' => $menuId,
                    'menu_name' => $menu->name,
                    'has_access' => $hasAccess,
                    'access_level' => $accessLevel,
                    'is_free' => $menu->is_free
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar acceso al menú',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
