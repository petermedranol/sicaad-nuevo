<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ShowImageController;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserPhotoController;
use App\Http\Middleware\CheckModuleAccess as ModuleAccess;

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
    Route::get('show-image/{path}', ShowImageController::class)->where('path', '.*');
    // Obtener usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Menús del usuario
    Route::get('/user/menus', [\App\Http\Controllers\MenuController::class, 'getUserMenus']);
    Route::get('/user/menu/{menuId}/access', [\App\Http\Controllers\MenuController::class, 'getMenuAccessLevel']);

});

Route::middleware(['auth:sanctum', ModuleAccess::class . ':configuration/users'])->group(function () {
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    Route::patch('users/{user}/photo', [UserPhotoController::class, 'update']);
});
