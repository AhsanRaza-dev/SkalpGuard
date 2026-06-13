<?php

namespace Database\Factories;

use App\Models\HairDiseaseDetection;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class HairDiseaseDetectionFactory extends Factory
{
    protected $model = HairDiseaseDetection::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'image_1' => null,
            'image_2' => null,
            'image_3' => null,
            'detection_result' => $this->faker->sentence,
            'recommended_treatment' => $this->faker->sentence,
            'severity_level' => $this->faker->randomElement(['Low', 'Medium', 'High', 'Critical']),
            'detection_date' => now()->toDateString(),
            'detection_time' => now()->toTimeString(),
            'notes' => $this->faker->optional()->paragraph,
        ];
    }
}
