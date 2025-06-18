<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Services\RecaptchaService;

class AuthController extends Controller
{
    protected $recaptchaService;

    public function __construct(RecaptchaService $recaptchaService)
    {
        $this->recaptchaService = $recaptchaService;
    }

    public function login(Request $request)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'recaptcha_response' => 'required|string',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'recaptcha_response.required' => 'La verificación reCAPTCHA es obligatoria.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de entrada inválidos.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar reCAPTCHA
        $recaptchaResponse = $request->input('recaptcha_response');
        $clientIp = $request->ip();
        
        if (!$this->recaptchaService->verify($recaptchaResponse, $clientIp)) {
            return response()->json([
                'message' => 'Verificación reCAPTCHA fallida. Por favor, intenta nuevamente.'
            ], 422);
        }

        // Intentar autenticación
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
            ], 401);
        }

        // Login exitoso
        $user = Auth::user();
        
        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ]
        ]);
    }

    /**
     * Get reCAPTCHA site key for frontend
     */
    public function getRecaptchaConfig()
    {
        return response()->json([
            'site_key' => $this->recaptchaService->getSiteKey()
        ]);
    }
}
