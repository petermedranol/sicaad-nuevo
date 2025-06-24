<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $module): Response
    {
        $user = $request->user();

        // Buscar el menú por slug o ruta
        $menu = \App\Models\Menu::where('link', '/'.$module)->first();

        //echo json_encode($module);

        if (!$user || !$menu || !$user->hasMenuAccess($menu->id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para acceder a este módulo'
            ], 403);
        }

        return $next($request);
    }
}
