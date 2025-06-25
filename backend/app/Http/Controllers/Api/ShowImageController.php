<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ShowImageController extends Controller
{
    public function __invoke($path)
    {
        $path = 'public/' . $path;
        
        if (!Storage::exists($path)) {
            return response()->json(['message' => 'Image not found'], Response::HTTP_NOT_FOUND);
        }

        $file = Storage::get($path);
        $type = Storage::mimeType($path);

        return response($file, 200)->header('Content-Type', $type);
    }
}
