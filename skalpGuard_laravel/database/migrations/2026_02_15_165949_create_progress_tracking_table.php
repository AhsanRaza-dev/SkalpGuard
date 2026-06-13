<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('progress_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Tracking date and time
            $table->date('tracking_date');
            $table->time('tracking_time');
            
            // Progress metrics
            $table->decimal('improvement_percentage', 5, 2)->nullable(); // e.g., 25.50 for 25.5%
            $table->integer('images_count')->nullable(); // Number of images taken
            $table->string('treatment_adherence')->nullable(); // e.g., Excellent, Good, Fair, Poor
            $table->string('overall_status')->nullable(); // e.g., Improving, Stable, Declining
            $table->text('progress_notes')->nullable();
            
            // Additional tracking data
            $table->json('additional_metrics')->nullable(); // For flexible data storage
            
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('user_id');
            $table->index('tracking_date');
            $table->index(['user_id', 'tracking_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_tracking');
    }
};
