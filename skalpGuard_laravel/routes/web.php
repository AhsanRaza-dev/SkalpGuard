<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/adminPanel/login');
});

use App\Http\Controllers\StorageProxyController;

// Proxy route to serve storage files when `public/storage` symlink is not available.
Route::get('/storage-proxy/{path}', [StorageProxyController::class, 'show'])
    ->where('path', '.*')
    ->name('storage.proxy');
