<?php

namespace App\Filament\Resources\ProgressTracking\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProgressTrackingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('tracking_date')
                    ->label('Date')
                    ->date()
                    ->sortable(),
                TextColumn::make('tracking_time')
                    ->label('Time')
                    ->time()
                    ->sortable(),
                TextColumn::make('improvement_percentage')
                    ->label('Improvement %')
                    ->numeric(decimalPlaces: 2)
                    ->suffix('%')
                    ->color(fn ($record) => $record->improvement_percentage > 0 ? 'success' : ($record->improvement_percentage < 0 ? 'danger' : 'gray'))
                    ->sortable(),
                TextColumn::make('overall_status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Improving', 'Significant Improvement' => 'success',
                        'Stable' => 'warning',
                        'Declining' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('treatment_adherence')
                    ->label('Adherence')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Excellent' => 'success',
                        'Good' => 'info',
                        'Fair' => 'warning',
                        'Poor' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('images_count')
                    ->label('Images')
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
            ->defaultSort('tracking_date', 'desc')
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
