<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ShowImageController extends Controller
{
    /**
     * Muestra una imagen de usuario
     *
     * @param int $userId
     * @param bool $thumbnail
     * @return \Illuminate\Http\Response
     */
    public function __invoke($userId, $thumbnail = true)
    {
        $user = User::find($userId);

        if (!$user || !$user->photo_path) {
            return response()->json(['error' => 'Image not found'], 404);
        }

        $isThumbnail = filter_var($thumbnail, FILTER_VALIDATE_BOOLEAN);
        $filename = $user->photo_path;
        if ($isThumbnail) {
            $filename = str_replace('.webp', '_thumb.webp', $filename);
        }
        $relativePath = 'photos/' . ($isThumbnail ? 'thumbnails/' : '') . $filename;
        $fullPath = storage_path('app/public/' . $relativePath);

        if (!file_exists($fullPath)) {
            return response()->json(['error' => 'Image not found'], 404);
        }

        $file = file_get_contents($fullPath);
        $type = mime_content_type($fullPath);
        $hash = md5_file($fullPath);

        return response($file)
            ->header('Content-Type', $type)
            ->header('Cache-Control', 'public, max-age=31536000')
            ->header('ETag', '"' . $hash . '"');
    }
}
