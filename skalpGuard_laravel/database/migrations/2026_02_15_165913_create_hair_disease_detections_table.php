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
        Schema::create('hair_disease_detections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Three images for the detection
            $table->string('image_1')->nullable();
            $table->string('image_2')->nullable();
            $table->string('image_3')->nullable();
            
            // Detection results
            $table->text('detection_result')->nullable();
            $table->text('recommended_treatment')->nullable();
            $table->string('severity_level')->nullable(); // e.g., Low, Medium, High, Critical
            $table->date('detection_date');
            $table->time('detection_time');
            
            // Additional metadata
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Index for faster queries
            $table->index('user_id');
            $table->index('detection_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hair_disease_detections');
    }
};
