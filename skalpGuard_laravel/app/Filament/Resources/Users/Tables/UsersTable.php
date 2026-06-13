<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\Action;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('profile_photo')
                    ->label('Photo')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&color=7F9CF5&background=EBF4FF')
                    ->size(40),
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),
                TextColumn::make('roles.name')
                    ->label('Role')
                    ->badge()
                    ->color('success'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
                Action::make('toggleBlock')
                    ->label(fn ($record) => $record->is_blocked ? 'Unblock' : 'Block')
                    ->icon(fn ($record) => $record->is_blocked ? 'heroicon-o-lock-open' : 'heroicon-o-lock-closed')
                    ->color(fn ($record) => $record->is_blocked ? 'success' : 'danger')
                    ->requiresConfirmation()
                    ->modalHeading(fn ($record) => $record->is_blocked ? 'Unblock User' : 'Block User')
                    ->modalDescription(fn ($record) => $record->is_blocked ? 'Are you sure you want to unblock this user?' : 'Are you sure you want to block this user?')
                    ->modalSubmitActionLabel(fn ($record) => $record->is_blocked ? 'Unblock' : 'Block')
                    ->action(fn ($record) => $record->update(['is_blocked' => !$record->is_blocked])),
                DeleteAction::make(),
            ])
            ->recordActionsColumnLabel('Action')
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
