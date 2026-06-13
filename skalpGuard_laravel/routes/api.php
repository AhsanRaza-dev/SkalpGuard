<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ScanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public route - Create user and get token
Route::post('/users', [UserController::class, 'store']);

// Public route - verify credentials and return token plus related user info
Route::post('/verify', [UserController::class, 'verify']);

// Protected routes - Require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Scan routes
    Route::post('/scans', [ScanController::class, 'store']);
    Route::get('/scans/{id}', [ScanController::class, 'show']);
    Route::get('/users/{userId}/scans', [ScanController::class, 'getUserScans']);
});
