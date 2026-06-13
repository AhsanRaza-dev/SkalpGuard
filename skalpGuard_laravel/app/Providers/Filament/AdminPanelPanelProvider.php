<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Illuminate\Support\Facades\Blade;
use App\Filament\Auth\Pages\CustomLogin;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use App\Filament\Widgets\UserStatsWidget;
use App\Http\Middleware\CheckAdminRole;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('adminPanel')
            ->path('adminPanel')
            ->login(CustomLogin::class)
            ->brandName('SkalpGuard Admin Penal')
            ->brandLogo(asset('images/logo.png'))
            // shrink logo height globally (login uses same image, additional CSS below handles page-specific sizing)
            ->brandLogoHeight('7rem')
            ->colors([
                // use custom primary color instead of generic emerald
                'primary' => '#344225',
            ])
            ->userMenuItems([
                \Filament\Navigation\MenuItem::make()
                    ->label('Profile')
                    ->url(fn () => \App\Filament\Pages\Profile::getUrl())
                    ->icon('heroicon-o-user-circle'),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                UserStatsWidget::class,
                AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
                CheckAdminRole::class,
            ])
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn (): string => Blade::render('
                    <style>
                        /* Remove background color */
                        body:has([class*="fi-auth"]),
                        body:has(.fi-simple-page),
                        [class*="fi-auth"],
                        [class*="fi-login"],
                        body[class*="login"],
                        .fi-auth-page,
                        .fi-login-page {
                            background: transparent !important;
                            background-color: #fff !important;
                        }

                        /* Card container styling (login page) */
                        .fi-simple-page,
                        [class*="fi-auth"] .fi-simple-page {
                            /* use the requested tan background color */
                            background: #FAD979 !important;
                            backdrop-filter: none !important;
                            /* restore rounded card look */
                            border-radius: 1rem !important;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
                            border: none !important;
                            /* keep some padding and width constraints */
                            padding: 2rem !important;
                            max-width: 28rem !important;
                            margin: 2rem auto !important;
                        }


                        /* Show brand text next to logo */
                        .fi-topbar .fi-logo {
                            display: flex;
                            align-items: center;
                        }
                        .fi-topbar .fi-logo::after {
                            content: " SkalpGuard Admin Penal";
                            margin-left: 0.5rem;
                            font-size: 1rem;
                            font-weight: 600;
                            color: #344225;
                        }

                        /* Remove spacing above and below logo on login page */
                        .fi-simple-page-header {
                            padding-top: 0 !important;
                            padding-bottom: 1.5rem !important;
                            margin-top: 0 !important;
                            margin-bottom: 0 !important;
                            text-align: center !important;
                        }

                        .fi-simple-page-header > *:first-child {
                            margin-top: 0 !important;
                            padding-top: 0 !important;
                        }

                        .fi-simple-page-header > *:last-child {
                            margin-bottom: 0 !important;
                            padding-bottom: 0 !important;
                        }

                        .fi-simple-page-header img,
                        .fi-simple-page-header svg {
                            margin: 0 auto 1.5rem !important;
                            padding-top: 0 !important;
                            padding-bottom: 0 !important;
                            display: block !important;
                            /* limit login logo size */
                            max-height: 4rem !important;
                            width: auto !important;
                            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) !important;
                        }

                        /* Target any logo container */
                        [class*="logo"],
                        [data-brand-logo] {
                            margin-top: 0 !important;
                            margin-bottom: 0 !important;
                            padding-top: 0 !important;
                            padding-bottom: 0 !important;
                        }

                        /* Remove spacing from parent containers */
                        .fi-simple-page-header > div,
                        .fi-simple-page-header > a {
                            margin-top: 0 !important;
                            margin-bottom: 0 !important;
                            padding-top: 0 !important;
                            padding-bottom: 0 !important;
                        }

                        /* Ensure content is above background */
                        .fi-simple-page > * {
                            position: relative;
                            z-index: 1;
                        }

                        /* Heading Styling */
                        .fi-simple-header-heading {
                            font-size: 1.875rem !important;
                            font-weight: 700 !important;
                            line-height: 2.25rem !important;
                            color: #1f2937 !important;
                            margin-bottom: 0.5rem !important;
                            text-align: center !important;
                        }

                        /* Subheading Styling */
                        .fi-simple-header-subheading {
                            font-size: 0.875rem !important;
                            color: #6b7280 !important;
                            text-align: center !important;
                            margin-bottom: 2rem !important;
                        }

                        /* Form Labels - Make them black */
                        .fi-simple-page form label,
                        .fi-simple-page form .fi-label,
                        .fi-simple-page form .fi-input-wrp label,
                        .fi-simple-page form .fi-field-wrapper label {
                            color: #000000 !important;
                            font-weight: 500 !important;
                        }

                        /* Form Input Styling */
                        .fi-simple-page form .fi-input-wrp {
                            margin-bottom: 1.25rem !important;
                        }

                        .fi-simple-page form input[type="email"],
                        .fi-simple-page form input[type="password"] {
                            border-radius: 8px !important;
                            border: 1px solid #e5e7eb !important;
                            padding: 0.75rem 1rem !important;
                            transition: all 0.2s ease !important;
                        }

                        .fi-simple-page form input[type="email"]:focus,
                        .fi-simple-page form input[type="password"]:focus {
                            border-color: #344225 !important;
                            box-shadow: 0 0 0 3px rgba(52, 66, 37, 0.1) !important;
                        }

                        /* Button Styling */
                        .fi-simple-page form button[type="submit"] {
                            width: 100% !important;
                            background: linear-gradient(135deg, #344225 0%, #2a361f 100%) !important;
                            color: #FAD979 !important;
                            border-radius: 8px !important;
                            padding: 0.75rem 1.5rem !important;
                            font-weight: 600 !important;
                            transition: all 0.2s ease !important;
                            box-shadow: 0 4px 6px rgba(52, 66, 37, 0.3) !important;
                        }

                        .fi-simple-page form button[type="submit"]:hover {
                            transform: translateY(-2px) !important;
                            box-shadow: 0 6px 12px rgba(52, 66, 37, 0.4) !important;
                        }

                        /* Remember Me Checkbox */
                        .fi-simple-page form .fi-checkbox {
                            margin-top: 0.5rem !important;
                        }

                        /* Links Styling */
                        .fi-simple-page a {
                            color: #344225 !important;
                            font-weight: 500 !important;
                            transition: color 0.2s ease !important;
                        }

                        .fi-simple-page a:hover {
                            color: #2a361f !important;
                        }

                        /* Make navbar logo smaller */
                        .fi-topbar .fi-logo,
                        .fi-topbar img[src*="logo.png"],
                        .fi-topbar [class*="logo"] img,
                        .fi-topbar .fi-brand-logo,
                        .fi-sidebar .fi-logo,
                        .fi-sidebar img[src*="logo.png"],
                        .fi-sidebar [class*="logo"] img,
                        .fi-sidebar .fi-brand-logo,
                        .fi-layout-topbar .fi-logo,
                        .fi-layout-topbar img[src*="logo.png"],
                        [class*="topbar"] [class*="logo"] img,
                        [class*="sidebar"] [class*="logo"] img {
                            height: 2rem !important;
                            max-height: 2rem !important;
                            width: auto !important;
                        }

                        /* Error Messages */
                        .fi-simple-page .fi-alert {
                            border-radius: 8px !important;
                            margin-bottom: 1.5rem !important;
                        }
                    </style>
                    <script>
                        // Remove background on login page
                        (function() {
                            if (window.location.pathname.includes(\'/login\')) {
                                document.body.style.background = \'#fff\';
                                document.body.style.backgroundColor = \'#fff\';
                            }
                        })();
                    </script>
                ')
            )
            ->renderHook(
                PanelsRenderHook::BODY_START,
                fn (): string => Blade::render('
                    <script>
                        // Remove background and card styling on login page
                        if (window.location.pathname.includes(\'/login\')) {
                            document.body.style.background = \'#fff\';
                            document.body.style.backgroundColor = \'#fff\';
                            var simplePage = document.querySelector(\'.fi-simple-page\');
                            if (simplePage) {
                                simplePage.style.background = \'transparent\';
                                simplePage.style.boxShadow = \'none\';
                                simplePage.style.borderRadius = \'0\';
                                simplePage.style.padding = \'0\';
                            }
                        }
                    </script>
                ')
            );
    }
}
