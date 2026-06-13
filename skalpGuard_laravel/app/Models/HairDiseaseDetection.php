<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HairDiseaseDetection extends Model
{
    protected $fillable = [
        'user_id',
        'image_1',
        'image_2',
        'image_3',
        'detection_result',
        'recommended_treatment',
        'severity_level',
        'detection_date',
        'detection_time',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'detection_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the detection
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all three images as an array
     */
    public function getImagesAttribute(): array
    {
        return array_filter([
            $this->image_1,
            $this->image_2,
            $this->image_3,
        ]);
    }

    /**
     * Get full image URLs
     */
    public function getImageUrlsAttribute(): array
    {
        return array_map(function ($image) {
            return $image ? asset('storage/' . $image) : null;
        }, $this->images);
    }
}
