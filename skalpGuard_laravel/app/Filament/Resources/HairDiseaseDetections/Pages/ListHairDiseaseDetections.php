<?php

namespace App\Filament\Resources\HairDiseaseDetections\Pages;

use App\Filament\Resources\HairDiseaseDetections\HairDiseaseDetectionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListHairDiseaseDetections extends ListRecords
{
    protected static string $resource = HairDiseaseDetectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
