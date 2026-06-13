<?php

namespace Database\Seeders;

use App\Models\ProgressTracking;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ProgressTrackingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first or create users manually.');
            return;
        }

        // Sample progress statuses
        $statuses = ['Improving', 'Stable', 'Declining', 'Significant Improvement'];
        $adherenceLevels = ['Excellent', 'Good', 'Fair', 'Poor'];

        // Create progress tracking for each user
        foreach ($users as $user) {
            // Create weekly progress entries for the last 3 months (12-16 entries)
            $numEntries = rand(12, 16);
            $baseDate = Carbon::now()->subMonths(3);
            
            $previousImprovement = 0;
            
            for ($i = 0; $i < $numEntries; $i++) {
                // Calculate tracking date (weekly intervals)
                $trackingDate = $baseDate->copy()->addWeeks($i)->addDays(rand(0, 6));
                $trackingTime = $trackingDate->copy()->setTime(rand(9, 18), rand(0, 59), 0);
                
                // Simulate gradual improvement or variation
                $improvementChange = rand(-5, 15); // Can improve or slightly decline
                $improvementPercentage = max(0, min(100, $previousImprovement + $improvementChange));
                $previousImprovement = $improvementPercentage;
                
                // Determine status based on improvement
                if ($improvementPercentage > 50) {
                    $status = 'Significant Improvement';
                } elseif ($improvementPercentage > 20) {
                    $status = 'Improving';
                } elseif ($improvementPercentage > -5) {
                    $status = 'Stable';
                } else {
                    $status = 'Declining';
                }
                
                // Generate progress notes
                $notes = $this->generateProgressNotes($improvementPercentage, $status, $i);
                
                // Additional metrics
                $additionalMetrics = [
                    'hair_density_score' => rand(50, 95),
                    'scalp_health_score' => rand(60, 100),
                    'treatment_compliance' => rand(70, 100),
                    'symptoms_severity' => rand(1, 10),
                ];

                ProgressTracking::create([
                    'user_id' => $user->id,
                    'tracking_date' => $trackingDate->format('Y-m-d'),
                    'tracking_time' => $trackingTime->format('H:i:s'),
                    'improvement_percentage' => $improvementPercentage,
                    'images_count' => rand(2, 5),
                    'treatment_adherence' => $adherenceLevels[array_rand($adherenceLevels)],
                    'overall_status' => $status,
                    'progress_notes' => $notes,
                    'additional_metrics' => $additionalMetrics,
                ]);
            }
        }

        $this->command->info('Progress tracking records seeded successfully!');
    }

    /**
     * Generate realistic progress notes
     */
    private function generateProgressNotes(float $improvement, string $status, int $week): string
    {
        $notes = [];
        
        if ($improvement > 30) {
            $notes[] = "Significant hair regrowth observed in affected areas.";
            $notes[] = "Patient reports reduced hair shedding.";
        } elseif ($improvement > 10) {
            $notes[] = "Gradual improvement in hair density.";
            $notes[] = "Scalp condition showing positive response to treatment.";
        } elseif ($improvement > -5) {
            $notes[] = "Hair condition remains stable.";
            $notes[] = "Continuing with current treatment regimen.";
        } else {
            $notes[] = "Monitoring hair loss patterns.";
            $notes[] = "Treatment adjustment may be required.";
        }
        
        $notes[] = "Week " . ($week + 1) . " of treatment progress.";
        $notes[] = "Next follow-up scheduled.";
        
        return implode(' ', $notes);
    }
}
