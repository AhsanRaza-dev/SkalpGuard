<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Resources\Pages\Concerns\InteractsWithRecord;
use Filament\Resources\Pages\Page;

class Dashboard extends Page
{
    use InteractsWithRecord;

    protected static string $resource = UserResource::class;

    protected string $view = 'filament.resources.users.pages.dashboard';

    public function mount(int|string $record): void
    {
        $this->record = $this->resolveRecord($record);
    }
}
