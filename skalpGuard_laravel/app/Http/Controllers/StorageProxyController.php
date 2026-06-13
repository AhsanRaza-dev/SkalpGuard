<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorageProxyController extends Controller
{
    /**
     * Serve files from storage/app/public when public/storage symlink is not present.
     */
    public function show(Request $request, $path)
    {
        $full = storage_path('app/public/' . $path);

        if (! is_file($full) || ! file_exists($full)) {
            abort(404);
        }

        $mime = mime_content_type($full) ?: 'application/octet-stream';

        return response()->file($full, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}
