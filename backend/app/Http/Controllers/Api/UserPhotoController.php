<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class UserPhotoController extends Controller
{
    public function update(Request $request, User $user)
    {
        try {
            $request->validate([
                'photo' => 'required|string'
            ]);

            // Decodificar base64 y obtener los datos binarios
            $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->photo));
            
            // Crear nombre único para el archivo
            $filename = 'user_' . $user->id . '_' . time() . '.webp';
            $thumbnailFilename = 'user_' . $user->id . '_' . time() . '_thumb.webp';

            // Crear instancia de ImageManager
            $manager = new ImageManager(new Driver());

            // Procesar la imagen principal
            $image = $manager->read($imageData);
            $image->scaleDown(350, 350);
            $imageWebp = $image->toWebp(80);

            // Crear y guardar thumbnail
            $thumbnail = $manager->read($imageData);
            $thumbnail->scaleDown(35, 35);
            $thumbnailWebp = $thumbnail->toWebp(80);

            // Guardar imágenes
            Storage::disk('public')->put('photos/' . $filename, $imageWebp);
            Storage::disk('public')->put('photos/thumbnails/' . $thumbnailFilename, $thumbnailWebp);

            // Eliminar fotos anteriores si existen
            if ($user->photo_path) {
                Storage::disk('public')->delete([
                    'photos/' . $user->photo_path,
                    'photos/thumbnails/' . str_replace('.webp', '_thumb.webp', $user->photo_path)
                ]);
            }

            // Actualizar usuario
            $user->update([
                'photo_path' => $filename
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Foto actualizada con éxito',
                'data' => [
                    'photo_url' => Storage::url('photos/' . $filename),
                    'thumbnail_url' => Storage::url('photos/thumbnails/' . $thumbnailFilename)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la foto: ' . $e->getMessage()
            ], 500);
        }
    }
}
