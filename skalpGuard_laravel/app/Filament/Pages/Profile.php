<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Pages\Page;
use Filament\Schemas\Schema;
use Filament\Support\Exceptions\Halt;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Hash;

class Profile extends Page implements HasForms
{
    use InteractsWithForms;
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-user-circle';

    protected string $view = 'filament.pages.profile';

    protected static ?string $navigationLabel = 'My Profile';

    protected static ?int $navigationSort = 99;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'name' => auth()->user()->name,
            'email' => auth()->user()->email,
            'profile_photo' => auth()->user()->profile_photo,
        ]);
    }

    protected function getFormSchema(): array
    {
        return [
            FileUpload::make('profile_photo')
                ->label('Profile Photo')
                ->image()
                ->avatar()
                ->directory('profile-photos')
                ->maxSize(10240),
            TextInput::make('name')
                ->required()
                ->maxLength(255),
            TextInput::make('email')
                ->email()
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true),
            TextInput::make('current_password')
                ->password()
                ->label('Current Password')
                ->dehydrated(false),
            TextInput::make('password')
                ->password()
                ->label('New Password')
                ->dehydrated(fn ($state) => filled($state))
                ->confirmed()
                ->minLength(8),
            TextInput::make('password_confirmation')
                ->password()
                ->label('Confirm New Password')
                ->dehydrated(false),
        ];
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components($this->getFormSchema())
            ->statePath('data');
    }

    public function save(): void
    {
        try {
            $data = $this->form->getState();

            $user = auth()->user();

            // Verify current password if changing password
            if (filled($data['current_password'])) {
                if (!Hash::check($data['current_password'], $user->password)) {
                    Notification::make()
                        ->danger()
                        ->title('Current password is incorrect')
                        ->send();
                    return;
                }
            }

            // Update user
            $user->name = $data['name'];
            $user->email = $data['email'];

            if (isset($data['profile_photo']) && !empty($data['profile_photo'])) {
                $user->profile_photo = is_array($data['profile_photo']) ? $data['profile_photo'][0] : $data['profile_photo'];
            }

            if (filled($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            $user->save();

            // Refresh the authenticated user to update the header
            auth()->setUser($user->fresh());

            Notification::make()
                ->success()
                ->title('Profile updated successfully')
                ->send();

        } catch (Halt $exception) {
            return;
        }
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save Changes')
                ->submit('save'),
        ];
    }
}
