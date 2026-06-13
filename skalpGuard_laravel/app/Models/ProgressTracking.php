<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressTracking extends Model
{
    protected $table = 'progress_tracking';

    protected $fillable = [
        'user_id',
        'tracking_date',
        'tracking_time',
        'improvement_percentage',
        'images_count',
        'treatment_adherence',
        'overall_status',
        'progress_notes',
        'additional_metrics',
    ];

    protected function casts(): array
    {
        return [
            'tracking_date' => 'date',
            'improvement_percentage' => 'decimal:2',
            'images_count' => 'integer',
            'additional_metrics' => 'array',
        ];
    }

    /**
     * Get the user that owns the progress tracking
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
