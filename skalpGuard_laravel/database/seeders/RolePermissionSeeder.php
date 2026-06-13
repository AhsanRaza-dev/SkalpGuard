<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin role
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Admin',
                'description' => 'Administrator with full access'
            ]
        );

        // Create User role
        $userRole = Role::firstOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'User',
                'description' => 'Regular user with limited access'
            ]
        );

        // Assign admin role to user ID 1
        $adminUser = User::find(1);
        if ($adminUser) {
            $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        // Assign user role to all other users
        $otherUsers = User::where('id', '!=', 1)->get();
        foreach ($otherUsers as $user) {
            $user->roles()->syncWithoutDetaching([$userRole->id]);
        }
    }
}
