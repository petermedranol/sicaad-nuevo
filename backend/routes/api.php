<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserPhotoController;
use App\Http\Controllers\Api\ShowImageController;
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
    // Obtener usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Menús del usuario
    Route::get('/user/menus', [\App\Http\Controllers\MenuController::class, 'getUserMenus']);
    Route::get('/user/menu/{menuId}/access', [\App\Http\Controllers\MenuController::class, 'getMenuAccessLevel']);

    // User preferences routes
    Route::post('/user/preferences', [\App\Http\Controllers\UserPreferenceController::class, 'store']);
    Route::get('/user/preferences', [\App\Http\Controllers\UserPreferenceController::class, 'show']);

    Route::get('images/user/{userId}/{thumbnail?}', ShowImageController::class);

});

Route::middleware(['auth:sanctum', ModuleAccess::class . ':settings/users'])->group(function () {
    // Ruta protegida para imágenes de usuario

    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    Route::patch('users/{user}/photo', [UserPhotoController::class, 'update']);
});
