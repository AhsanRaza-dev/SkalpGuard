<?php

namespace App\Filament\Auth\Pages;

use Filament\Auth\Pages\Login as BaseLogin;

class CustomLogin extends BaseLogin
{
    public function getHeading(): string
    {
        return 'Welcome Back';
    }

    public function getSubheading(): string
    {
        return 'Sign in to your admin account';
    }
}
