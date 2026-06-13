<?php

return [

    'broadcasting' => [
        // ...
    ],

    'default_filesystem_disk' => env('FILESYSTEM_DISK', 'local'),

    'assets_path' => null,

    'cache_path' => base_path('bootstrap/cache/filament'),

    'livewire_loading_delay' => 'default',

    'file_generation' => [
        'flags' => [],
    ],

    'system_route_prefix' => 'filament',

    /*
     |--------------------------------------------------------------------------
     | Panels
     |--------------------------------------------------------------------------
     |
     | Define your panels here. Each panel can have its own path, title, and
     | default setting. The panel with 'default' => true will be used for
     | commands like `make:filament-user`.
     |
     */
    'panels' => [
        'admin' => [
            'path' => '/admin',       // URL: yoursite.com/admin
            'title' => 'Admin Panel', // Panel title
            'default' => true,        // 🔑 This makes it the default panel
        ],
    ],

];

