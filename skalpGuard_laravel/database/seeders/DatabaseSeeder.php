<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Update user ID 1 password to 12345678
        $user = User::find(1);
        if ($user) {
            $user->password = Hash::make('12345678');
            $user->save();
        }

        // Seed hair disease detections
        $this->call([
            HairDiseaseDetectionSeeder::class,
            ProgressTrackingSeeder::class,
        ]);
    }
}
