<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

// Ruta para obtener el token CSRF (necesario para Angular)
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Ruta de login
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $credentials = $request->only('email', 'password');

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

    $request->session()->regenerate();
    
    return response()->json([
        'message' => 'Inicio de sesión exitoso',
        'user' => Auth::user()
    ]);
});

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
    
    // Otras rutas protegidas aquí...
});

