<?php

namespace App\Filament\Resources\ProgressTracking\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Schemas\Schema;

class ProgressTrackingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->label('User')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),
                DatePicker::make('tracking_date')
                    ->label('Tracking Date')
                    ->required()
                    ->default(now()),
                TimePicker::make('tracking_time')
                    ->label('Tracking Time')
                    ->required()
                    ->default(now()),
                TextInput::make('improvement_percentage')
                    ->label('Improvement Percentage')
                    ->numeric()
                    ->suffix('%')
                    ->minValue(-100)
                    ->maxValue(100)
                    ->step(0.01),
                TextInput::make('images_count')
                    ->label('Images Count')
                    ->numeric()
                    ->minValue(0),
                Select::make('treatment_adherence')
                    ->label('Treatment Adherence')
                    ->options([
                        'Excellent' => 'Excellent',
                        'Good' => 'Good',
                        'Fair' => 'Fair',
                        'Poor' => 'Poor',
                    ]),
                Select::make('overall_status')
                    ->label('Overall Status')
                    ->options([
                        'Improving' => 'Improving',
                        'Stable' => 'Stable',
                        'Declining' => 'Declining',
                        'Significant Improvement' => 'Significant Improvement',
                    ])
                    ->required(),
                Textarea::make('progress_notes')
                    ->label('Progress Notes')
                    ->rows(4),
            ]);
    }
}
