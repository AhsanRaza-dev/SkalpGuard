<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UpdateUserPasswordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update user ID 1 password to 12345678
        $user = User::find(1);
        if ($user) {
            $user->password = Hash::make('12345678');
            $user->save();
            $this->command->info('Password updated successfully for user ID 1');
        } else {
            $this->command->error('User ID 1 not found');
        }
    }
}
