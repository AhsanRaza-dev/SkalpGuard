<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\HairDiseaseDetection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_verify_with_valid_credentials_returns_data_and_token()
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
            'is_blocked' => false,
        ]);

        // add a couple of hair detections
        HairDiseaseDetection::factory()->create(['user_id' => $user->id]);
        HairDiseaseDetection::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson('/api/verify', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'id',
                         'name',
                         'email',
                         'hair_disease_detections',
                     ],
                     'token',
                     'token_type',
                 ]);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_verify_with_invalid_password_returns_401()
    {
        $user = User::factory()->create([
            'password' => Hash::make('correct'),
        ]);

        $response = $this->postJson('/api/verify', [
            'email' => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['success' => false]);
    }

    public function test_verify_non_existent_user_returns_404()
    {
        $response = $this->postJson('/api/verify', [
            'email' => 'doesnotexist@example.com',
            'password' => 'anything',
        ]);

        $response->assertStatus(404)
                 ->assertJson(['success' => false]);
    }

    public function test_verify_blocked_user_returns_403()
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret123'),
            'is_blocked' => true,
        ]);

        $response = $this->postJson('/api/verify', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(403)
                 ->assertJson(['success' => false]);
    }

    public function test_verify_validation_error_returns_422()
    {
        $response = $this->postJson('/api/verify', []);
        $response->assertStatus(422)
                 ->assertJson(['success' => false])
                 ->assertJsonStructure(['errors' => ['email', 'password']]);
    }

    public function test_show_user_returns_password_and_profile_photo_url()
    {
        $user = User::factory()->create([
            'password' => Hash::make('abc123'),
            'profile_photo' => 'profile-photos/test.jpg',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'email',
                         'password',
                         'profile_photo_url',
                     ],
                 ]);

        $this->assertEquals($user->password, $response->json('data.password'));
        $this->assertStringContainsString('test.jpg', $response->json('data.profile_photo_url'));
    }

    public function test_update_user_ignores_email_and_allows_name_password_photo()
    {
        $user = User::factory()->create([
            'password' => Hash::make('initial'),
            'email' => 'original@example.com',
        ]);

        $token = $user->createToken('upd')->plainTextToken;

        $patch = [
            'email' => 'hacked@example.com',
            'name' => 'New Name',
            'password' => 'newpass',
            'password_confirmation' => 'newpass',
        ];

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson("/api/users/{$user->id}", $patch);

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);

        $user->refresh();
        $this->assertEquals('original@example.com', $user->email);
        $this->assertEquals('New Name', $user->name);
        $this->assertTrue(Hash::check('newpass', $user->password));
    }
}
