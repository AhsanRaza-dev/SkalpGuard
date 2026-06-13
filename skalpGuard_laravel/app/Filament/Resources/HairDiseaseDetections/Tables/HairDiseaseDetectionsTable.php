<?php

namespace App\Filament\Resources\HairDiseaseDetections\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ViewColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class HairDiseaseDetectionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable(),
                ViewColumn::make('images')
                    ->label('Images')
                    ->view('filament.columns.hair-images'),
                TextColumn::make('detection_result')
                    ->label('Detection Result')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->detection_result)
                    ->searchable(),
                TextColumn::make('severity_level')
                    ->label('Severity')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Low' => 'success',
                        'Medium' => 'warning',
                        'High' => 'danger',
                        'Critical' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('detection_date')
                    ->label('Date')
                    ->date()
                    ->sortable(),
                TextColumn::make('detection_time')
                    ->label('Time')
                    ->time()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->defaultSort('detection_date', 'desc')
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
