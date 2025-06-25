<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ImageController extends Controller
{
    public function show($path)
    {
        // Validar que el archivo exista
        if (!Storage::exists('public/' . $path)) {
            return response()->json(['message' => 'Image not found'], Response::HTTP_NOT_FOUND);
        }

        // Obtener el tipo de contenido
        $mimeType = Storage::mimeType('public/' . $path);

        // Servir el archivo
        return response()->file(
            Storage::path('public/' . $path),
            ['Content-Type' => $mimeType]
        );
    }
}
