<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Resources\Pages\Concerns\InteractsWithRecord;
use Filament\Resources\Pages\Page;

class EditProfile extends Page
{
    use InteractsWithRecord;

    protected static string $resource = UserResource::class;

    protected string $view = 'filament.resources.users.pages.edit-profile';

    public function mount(int|string $record): void
    {
        $this->record = $this->resolveRecord($record);
    }
}
