<?php

namespace App\Filament\Resources\HairDiseaseDetections\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TimePicker;
use Filament\Schemas\Schema;

class HairDiseaseDetectionForm
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
                FileUpload::make('image_1')
                    ->label('Image 1')
                    ->image()
                    ->directory('hair-detections')
                    ->maxSize(10240)
                    ->required(),
                FileUpload::make('image_2')
                    ->label('Image 2')
                    ->image()
                    ->directory('hair-detections')
                    ->maxSize(10240)
                    ->required(),
                FileUpload::make('image_3')
                    ->label('Image 3')
                    ->image()
                    ->directory('hair-detections')
                    ->maxSize(10240)
                    ->required(),
                Textarea::make('detection_result')
                    ->label('Detection Result')
                    ->rows(3)
                    ->required(),
                Textarea::make('recommended_treatment')
                    ->label('Recommended Treatment')
                    ->rows(3)
                    ->required(),
                Select::make('severity_level')
                    ->label('Severity Level')
                    ->options([
                        'Low' => 'Low',
                        'Medium' => 'Medium',
                        'High' => 'High',
                        'Critical' => 'Critical',
                    ])
                    ->required(),
                DatePicker::make('detection_date')
                    ->label('Detection Date')
                    ->required()
                    ->default(now()),
                TimePicker::make('detection_time')
                    ->label('Detection Time')
                    ->required()
                    ->default(now()),
                Textarea::make('notes')
                    ->label('Notes')
                    ->rows(2),
            ]);
    }
}
