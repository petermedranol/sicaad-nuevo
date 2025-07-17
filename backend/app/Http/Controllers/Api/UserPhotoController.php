<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class UserPhotoController extends Controller
{    public function update(Request $request, User $user)
    {
        // Debug logging
        error_log('=== UserPhotoController::update INICIADO ===');
        error_log('Request method: ' . $request->method());
        error_log('Content-Type: ' . $request->header('Content-Type'));
        error_log('Has file photo: ' . ($request->hasFile('photo') ? 'SÍ' : 'NO'));
        error_log('Request all keys: ' . json_encode(array_keys($request->all())));
        error_log('Request all files: ' . json_encode(array_keys($request->allFiles())));
        error_log('Raw input length: ' . strlen($request->getContent()));

        try {
            $photoData = null;
            $isFile = false;

            // Prioridad 1: Archivo subido via FormData (File/Blob)
            if ($request->hasFile('photo')) {
                $uploadedFile = $request->file('photo');
                error_log('File details - Name: ' . $uploadedFile->getClientOriginalName() .
                          ', Size: ' . $uploadedFile->getSize() .
                          ', Type: ' . $uploadedFile->getMimeType());

                if ($uploadedFile->isValid()) {
                    $photoData = file_get_contents($uploadedFile->getRealPath());
                    $isFile = true;
                    error_log('SUCCESS: Processing as uploaded file, binary size: ' . strlen($photoData));
                }
            }

            // Prioridad 2: Datos base64 (fallback)
            if (!$photoData && $request->has('photo')) {
                $photoInput = $request->input('photo');
                error_log('Raw photo input type: ' . gettype($photoInput));
                error_log('Raw photo input length: ' . (is_string($photoInput) ? strlen($photoInput) : 'not string'));

                if (is_string($photoInput) && str_contains($photoInput, 'data:image/')) {
                    // Extraer solo la parte base64
                    $base64Data = preg_replace('#^data:image/[^;]+;base64,#', '', $photoInput);
                    $photoData = base64_decode($base64Data);
                    error_log('SUCCESS: Processing as base64 string, decoded size: ' . strlen($photoData));
                }
            }

            // Prioridad 3: Revisar si hay datos binarios directos en el input
            if (!$photoData && $request->has('photo')) {
                $photoInput = $request->input('photo');
                if (is_string($photoInput) && !str_contains($photoInput, 'data:image/')) {
                    // Podría ser datos binarios directos
                    $photoData = $photoInput;
                    error_log('SUCCESS: Processing as binary data, size: ' . strlen($photoData));
                }
            }

            error_log('Final photoData length: ' . (is_string($photoData) ? strlen($photoData) : 'null/invalid'));

            if (!$photoData || strlen($photoData) < 100) {
                error_log('ERROR: No valid photo data received');
                throw new \Exception('No se recibieron datos válidos de imagen. Se esperaba archivo o cadena base64.');
            }

            // Validar que es una imagen válida
            $imageInfo = getimagesizefromstring($photoData);
            if (!$imageInfo) {
                error_log('ERROR: Invalid image data');
                throw new \Exception('Los datos de imagen recibidos no son válidos');
            }

            error_log('SUCCESS: Image validation passed: ' . $imageInfo[0] . 'x' . $imageInfo[1] . ', MIME: ' . $imageInfo['mime']);

            // Crear nombres únicos para los archivos
            $timestamp = time();
            $filename = 'user_' . $user->id . '_' . $timestamp . '.webp';
            $thumbnailFilename = 'user_' . $user->id . '_' . $timestamp . '_thumb.webp';

            // Crear instancia de ImageManager
            $manager = new ImageManager(new Driver());

            // Procesar imagen principal (350x350 max, calidad 80%)
            $image = $manager->read($photoData);
            $image->scaleDown(350, 350);
            $imageWebp = $image->toWebp(80);

            // Crear thumbnail (35x35 max, calidad 80%)
            $thumbnail = $manager->read($photoData); // Corregido: usar $photoData
            $thumbnail->scaleDown(35, 35);
            $thumbnailWebp = $thumbnail->toWebp(80);

            // Asegurar que existen los directorios
            Storage::disk('public')->makeDirectory('photos');
            Storage::disk('public')->makeDirectory('photos/thumbnails');

            // Guardar las imágenes
            Storage::disk('public')->put('photos/' . $filename, $imageWebp);
            Storage::disk('public')->put('photos/thumbnails/' . $thumbnailFilename, $thumbnailWebp);

            // Eliminar fotos anteriores si existen
            if ($user->photo_path) {
                $oldPhoto = $user->photo_path;
                $oldThumbnail = str_replace('.webp', '_thumb.webp', $oldPhoto);

                Storage::disk('public')->delete([
                    'photos/' . $oldPhoto,
                    'photos/thumbnails/' . $oldThumbnail
                ]);

                error_log('SUCCESS: Deleted old photos: ' . $oldPhoto . ', ' . $oldThumbnail);
            }

            // Generar hash único para cache busting
            $photoHash = md5($filename . $timestamp);

            // Actualizar usuario
            $user->update([
                'photo_path' => $filename,
                'photo_hash' => $photoHash
            ]);

            error_log('SUCCESS: Photo update successful: ' . $filename);

            return response()->json([
                'success' => true,
                'message' => 'Foto actualizada con éxito',
                'data' => [
                    'photo_url' => Storage::url('photos/' . $filename),
                    'thumbnail_url' => Storage::url('photos/thumbnails/' . $thumbnailFilename),
                    'photo_hash' => $photoHash,
                    'processed_as' => $isFile ? 'file_upload' : 'base64_data'
                ]
            ]);

        } catch (\Exception $e) {
            error_log('ERROR: UserPhotoController error: ' . $e->getMessage());
            error_log('ERROR: Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la foto: ' . $e->getMessage()
            ], 500);
        }
    }
}
