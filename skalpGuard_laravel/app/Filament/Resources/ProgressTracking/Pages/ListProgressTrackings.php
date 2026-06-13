<?php

namespace App\Filament\Resources\ProgressTracking\Pages;

use App\Filament\Resources\ProgressTracking\ProgressTrackingResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProgressTrackings extends ListRecords
{
    protected static string $resource = ProgressTrackingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
