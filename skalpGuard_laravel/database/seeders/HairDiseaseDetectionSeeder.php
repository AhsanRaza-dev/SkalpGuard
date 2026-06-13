<?php

namespace Database\Seeders;

use App\Models\HairDiseaseDetection;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class HairDiseaseDetectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users or create sample users if none exist
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first or create users manually.');
            return;
        }

        // Sample detection results
        $detectionResults = [
            [
                'detection_result' => 'Androgenetic Alopecia (Male Pattern Baldness) detected. Hair thinning observed in crown and frontal regions.',
                'recommended_treatment' => 'Minoxidil 5% solution twice daily, Finasteride 1mg daily, DHT-blocking shampoo, Scalp massage therapy',
                'severity_level' => 'High',
                'notes' => 'Early stage pattern baldness. Treatment should begin immediately for best results.',
            ],
            [
                'detection_result' => 'Telogen Effluvium detected. Excessive hair shedding due to stress or nutritional deficiency.',
                'recommended_treatment' => 'Biotin supplements, Iron supplements, Stress management, Balanced diet, Scalp care routine',
                'severity_level' => 'Medium',
                'notes' => 'Temporary condition. Recovery expected within 3-6 months with proper treatment.',
            ],
            [
                'detection_result' => 'Alopecia Areata detected. Patchy hair loss in circular patterns.',
                'recommended_treatment' => 'Corticosteroid injections, Topical immunotherapy, Minoxidil, Vitamin D supplements',
                'severity_level' => 'Medium',
                'notes' => 'Autoimmune condition. Requires medical supervision.',
            ],
            [
                'detection_result' => 'Seborrheic Dermatitis detected. Scalp inflammation with excessive oil production.',
                'recommended_treatment' => 'Anti-dandruff shampoo (Ketoconazole), Tea tree oil, Scalp exfoliation, Dietary changes',
                'severity_level' => 'Low',
                'notes' => 'Manageable condition with proper scalp care.',
            ],
            [
                'detection_result' => 'Traction Alopecia detected. Hair loss due to tight hairstyles or hair pulling.',
                'recommended_treatment' => 'Avoid tight hairstyles, Scalp massage, Hair growth serums, Protective styling',
                'severity_level' => 'Low',
                'notes' => 'Preventable condition. Early intervention recommended.',
            ],
        ];

        // Sample image paths (you can replace these with actual image paths)
        $sampleImages = [
            ['image_1' => 'hair-detections/sample-1-front.jpg', 'image_2' => 'hair-detections/sample-1-top.jpg', 'image_3' => 'hair-detections/sample-1-side.jpg'],
            ['image_1' => 'hair-detections/sample-2-front.jpg', 'image_2' => 'hair-detections/sample-2-top.jpg', 'image_3' => 'hair-detections/sample-2-side.jpg'],
            ['image_1' => 'hair-detections/sample-3-front.jpg', 'image_2' => 'hair-detections/sample-3-top.jpg', 'image_3' => 'hair-detections/sample-3-side.jpg'],
        ];

        // Create detections for each user
        foreach ($users as $user) {
            // Create 2-4 detections per user with different dates
            $numDetections = rand(2, 4);
            
            for ($i = 0; $i < $numDetections; $i++) {
                $detectionData = $detectionResults[array_rand($detectionResults)];
                $imageSet = $sampleImages[array_rand($sampleImages)];
                
                // Create detection dates in the past (last 6 months)
                $daysAgo = rand(0, 180);
                $detectionDate = Carbon::now()->subDays($daysAgo);
                $detectionTime = Carbon::now()->subDays($daysAgo)->setTime(rand(9, 17), rand(0, 59), 0);

                HairDiseaseDetection::create([
                    'user_id' => $user->id,
                    'image_1' => $imageSet['image_1'],
                    'image_2' => $imageSet['image_2'],
                    'image_3' => $imageSet['image_3'],
                    'detection_result' => $detectionData['detection_result'],
                    'recommended_treatment' => $detectionData['recommended_treatment'],
                    'severity_level' => $detectionData['severity_level'],
                    'detection_date' => $detectionDate->format('Y-m-d'),
                    'detection_time' => $detectionTime->format('H:i:s'),
                    'notes' => $detectionData['notes'],
                ]);
            }
        }

        $this->command->info('Hair disease detections seeded successfully!');
    }
}
