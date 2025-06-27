<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InitialSetupSeeder extends Seeder
{
    public function run()
    {
        // Insertar menús
        DB::table('menus')->insert([
            [
                'id' => 1,
                'parent_id' => null,
                'name' => 'Inicio',
                'icon' => 'Home',
                'date_created' => '2025-06-18',
                'link' => '/dashboard',
                'description' => 'Página de inicio del sistema',
                'order' => 1,
                'is_free' => 1,
                'user_type_id' => null,
                'is_active' => 1,
                'created_at' => '2025-06-18 18:32:33',
                'updated_at' => null,
            ],
            [
                'id' => 2,
                'parent_id' => null,
                'name' => 'Configuración',
                'icon' => 'Settings',
                'date_created' => '2025-06-18',
                'link' => null,
                'description' => 'Configuraciones del sistema',
                'order' => 2,
                'is_free' => 1,
                'user_type_id' => null,
                'is_active' => 1,
                'created_at' => '2025-06-18 18:32:33',
                'updated_at' => null,
            ],
            [
                'id' => 3,
                'parent_id' => 2,
                'name' => 'Usuarios',
                'icon' => 'Users',
                'date_created' => '2025-06-18',
                'link' => '/settings/users',
                'description' => 'Gestión de usuarios del sistema',
                'order' => 1,
                'is_free' => 0,
                'user_type_id' => null,
                'is_active' => 1,
                'created_at' => '2025-06-18 18:32:33',
                'updated_at' => null,
            ],
        ]);

        // Insertar usuario
        DB::table('users')->insert([
            'id' => 1,
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin123'), // Cambia la contraseña si lo necesitas
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Dar acceso al usuario al menú 3
        DB::table('user_menu_accesses')->insert([
            'user_id' => 1,
            'menu_id' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
