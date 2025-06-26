<?php

namespace App\Http\Controllers;

use App\Models\UserPreference;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\MenuController;

class UserPreferenceController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array'
        ]);

        $user = Auth::user();
        $preferences = $request->input('preferences');

        UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            ['preferences' => $preferences]
        );

        return response()->json(['message' => 'Preferences saved successfully']);
    }

    public function show()
    {
        $user = Auth::user();
        $preferences = optional($user->preference)->preferences ?? [];
        
        // Usar el MenuController para obtener los menús con toda la lógica de permisos
        $menuController = new MenuController();
        $menuResponse = $menuController->getUserMenus(request())->getData();
        
        // Actualizar los menús en las preferencias con los menús reales del usuario
        $preferences['menuItems'] = $menuResponse->data->menus;

        return response()->json(['preferences' => $preferences]);
    }
}
