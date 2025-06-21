<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Controllers\AuthController;

// Ruta para obtener el token CSRF (necesario para Angular)
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Rutas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::get('/recaptcha/config', [AuthController::class, 'getRecaptchaConfig']);

// Ruta de logout
Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    
    return response()->json(['message' => 'Sesión cerrada exitosamente']);
});

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Obtener usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Menús del usuario
    Route::get('/user/menus', [\App\Http\Controllers\MenuController::class, 'getUserMenus']);
    Route::get('/user/menu/{menuId}/access', [\App\Http\Controllers\MenuController::class, 'getMenuAccessLevel']);
    
    // CRUD de usuarios
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    
    // Otras rutas protegidas aquí...
});

