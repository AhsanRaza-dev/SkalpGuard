<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index()
    {
        $users = User::all();
        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }

    /**
     * Store a newly created user and return auth token.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'profile_photo' => 'nullable|image|max:10240',
            'gender' => 'nullable|in:male,female,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_blocked' => false,
        ];

        if ($request->has('gender')) {
            $userData['gender'] = $request->gender;
        }

        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $userData['profile_photo'] = $path;
        }

        $user = User::create($userData);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // include hashed password and profile photo URL in response
        $userArray = $user->makeVisible('password')
                          ->append('profile_photo_url')
                          ->toArray();

        return response()->json([
            'success' => true,
            'data' => $userArray
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // email is intentionally excluded so it cannot be changed via this endpoint
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'password' => 'sometimes|required|string|min:8|confirmed',
            'profile_photo' => 'nullable|image|max:10240',
            'is_blocked' => 'sometimes|boolean',
            'gender' => 'nullable|in:male,female,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        // email updates are not permitted; ignore if provided

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->has('is_blocked')) {
            $user->is_blocked = $request->is_blocked;
        }

        if ($request->has('gender')) {
            $user->gender = $request->gender;
        }

        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo = $path;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ], 200);
    }

    /**
     * Verify user credentials and return token along with profile and scan data.
     *
     * Public endpoint used by mobile/web app to log in. It checks that the email
     * exists, the password matches, and the account is not blocked. On success
     * we generate a new Sanctum token and return the user record along with any
     * associated hair disease detections (scans) and a profile photo URL.
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if ($user->is_blocked) {
            return response()->json([
                'success' => false,
                'message' => 'User account is blocked'
            ], 403);
        }

        // eager load hair scans and prepare user data
        $user->load('hairDiseaseDetections');
        $userArray = $user->makeHidden(['password', 'remember_token'])
                          ->append('profile_photo_url')
                          ->toArray();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Verification successful',
            'data' => $userArray,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 200);
    }
}
