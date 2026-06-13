<?php

namespace App\Filament\Resources\HairDiseaseDetections;

use App\Filament\Resources\HairDiseaseDetections\Pages\CreateHairDiseaseDetection;
use App\Filament\Resources\HairDiseaseDetections\Pages\EditHairDiseaseDetection;
use App\Filament\Resources\HairDiseaseDetections\Pages\ListHairDiseaseDetections;
use App\Filament\Resources\HairDiseaseDetections\Schemas\HairDiseaseDetectionForm;
use App\Filament\Resources\HairDiseaseDetections\Tables\HairDiseaseDetectionsTable;
use App\Models\HairDiseaseDetection;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class HairDiseaseDetectionResource extends Resource
{
    protected static ?string $model = HairDiseaseDetection::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCamera;

    protected static ?string $navigationLabel = 'Scans';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return HairDiseaseDetectionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return HairDiseaseDetectionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListHairDiseaseDetections::route('/'),
            'create' => CreateHairDiseaseDetection::route('/create'),
            'edit' => EditHairDiseaseDetection::route('/{record}/edit'),
        ];
    }
}
