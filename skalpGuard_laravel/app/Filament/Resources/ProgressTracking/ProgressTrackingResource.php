<?php

namespace App\Filament\Resources\ProgressTracking;

use App\Filament\Resources\ProgressTracking\Pages\CreateProgressTracking;
use App\Filament\Resources\ProgressTracking\Pages\EditProgressTracking;
use App\Filament\Resources\ProgressTracking\Pages\ListProgressTrackings;
use App\Filament\Resources\ProgressTracking\Schemas\ProgressTrackingForm;
use App\Filament\Resources\ProgressTracking\Tables\ProgressTrackingsTable;
use App\Models\ProgressTracking;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ProgressTrackingResource extends Resource
{
    protected static ?string $model = ProgressTracking::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static ?string $navigationLabel = 'Progress';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return ProgressTrackingForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ProgressTrackingsTable::configure($table);
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
            'index' => ListProgressTrackings::route('/'),
            'create' => CreateProgressTracking::route('/create'),
            'edit' => EditProgressTracking::route('/{record}/edit'),
        ];
    }
}
