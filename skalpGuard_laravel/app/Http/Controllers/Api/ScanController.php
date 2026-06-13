<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HairDiseaseDetection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ScanController extends Controller
{
    /**
     * Store a new scan with 3 images and current date/time
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'image_1' => 'required|image|max:10240', // 10MB max
            'image_2' => 'required|image|max:10240',
            'image_3' => 'required|image|max:10240',
            'detection_result' => 'nullable|string',
            'recommended_treatment' => 'nullable|string',
            'severity_level' => 'nullable|string|in:Low,Medium,High,Critical',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Get current date and time
        $now = Carbon::now();
        $detectionDate = $now->format('Y-m-d');
        $detectionTime = $now->format('H:i:s');

        // Store images
        $image1Path = $request->file('image_1')->store('hair-detections', 'public');
        $image2Path = $request->file('image_2')->store('hair-detections', 'public');
        $image3Path = $request->file('image_3')->store('hair-detections', 'public');

        // Create scan record
        $scan = HairDiseaseDetection::create([
            'user_id' => $request->user_id,
            'image_1' => $image1Path,
            'image_2' => $image2Path,
            'image_3' => $image3Path,
            'detection_result' => $request->detection_result,
            'recommended_treatment' => $request->recommended_treatment,
            'severity_level' => $request->severity_level,
            'detection_date' => $detectionDate,
            'detection_time' => $detectionTime,
            'notes' => $request->notes,
        ]);

        // Load user relationship
        $scan->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Scan created successfully',
            'data' => [
                'id' => $scan->id,
                'user_id' => $scan->user_id,
                'user_name' => $scan->user->name ?? null,
                'image_1' => asset('storage/' . $scan->image_1),
                'image_2' => asset('storage/' . $scan->image_2),
                'image_3' => asset('storage/' . $scan->image_3),
                'detection_result' => $scan->detection_result,
                'recommended_treatment' => $scan->recommended_treatment,
                'severity_level' => $scan->severity_level,
                'detection_date' => $scan->detection_date,
                'detection_time' => $scan->detection_time,
                'notes' => $scan->notes,
                'created_at' => $scan->created_at,
                'updated_at' => $scan->updated_at,
            ]
        ], 201);
    }

    /**
     * Get all scans for a specific user
     * 
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserScans(Request $request, $userId)
    {
        $validator = Validator::make(['user_id' => $userId], [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $scans = HairDiseaseDetection::where('user_id', $userId)
            ->orderBy('detection_date', 'desc')
            ->orderBy('detection_time', 'desc')
            ->get();

        $scansData = $scans->map(function ($scan) {
            return [
                'id' => $scan->id,
                'user_id' => $scan->user_id,
                'image_1' => $scan->image_1 ? asset('storage/' . $scan->image_1) : null,
                'image_2' => $scan->image_2 ? asset('storage/' . $scan->image_2) : null,
                'image_3' => $scan->image_3 ? asset('storage/' . $scan->image_3) : null,
                'detection_result' => $scan->detection_result,
                'recommended_treatment' => $scan->recommended_treatment,
                'severity_level' => $scan->severity_level,
                'detection_date' => $scan->detection_date,
                'detection_time' => $scan->detection_time,
                'notes' => $scan->notes,
                'created_at' => $scan->created_at,
                'updated_at' => $scan->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $scansData,
            'count' => $scansData->count()
        ], 200);
    }

    /**
     * Get a single scan by ID
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $scan = HairDiseaseDetection::with('user')->find($id);

        if (!$scan) {
            return response()->json([
                'success' => false,
                'message' => 'Scan not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $scan->id,
                'user_id' => $scan->user_id,
                'user_name' => $scan->user->name ?? null,
                'user_email' => $scan->user->email ?? null,
                'image_1' => $scan->image_1 ? asset('storage/' . $scan->image_1) : null,
                'image_2' => $scan->image_2 ? asset('storage/' . $scan->image_2) : null,
                'image_3' => $scan->image_3 ? asset('storage/' . $scan->image_3) : null,
                'detection_result' => $scan->detection_result,
                'recommended_treatment' => $scan->recommended_treatment,
                'severity_level' => $scan->severity_level,
                'detection_date' => $scan->detection_date,
                'detection_time' => $scan->detection_time,
                'notes' => $scan->notes,
                'created_at' => $scan->created_at,
                'updated_at' => $scan->updated_at,
            ]
        ], 200);
    }
}
