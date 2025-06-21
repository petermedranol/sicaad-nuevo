<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\UserMenuAccess;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Solo crear si no existen menús
        if (Menu::count() > 0) {
            $this->command->info('Los menús ya existen.');
            return;
        }

        // Crear menús básicos
        $menus = [
            [
                'id' => 1,
                'parent_id' => null,
                'name' => 'Inicio',
                'icon' => 'Home', // Lucide icon
                'date_created' => now(),
                'link' => '/dashboard',
                'description' => 'Página de inicio del sistema',
                'order' => 1,
                'is_free' => true, // Libre para todos
                'user_type_id' => null, // Para todos los tipos
                'is_active' => true,
            ],
            [
                'id' => 2,
                'parent_id' => null,
                'name' => 'Configuración',
                'icon' => 'Settings', // Lucide icon
                'date_created' => now(),
                'link' => null, // Es un menú padre
                'description' => 'Configuraciones del sistema',
                'order' => 2,
                'is_free' => true, // Libre porque es padre
                'user_type_id' => null,
                'is_active' => true,
            ],
            [
                'id' => 3,
                'parent_id' => 2, // Hijo de Configuración
                'name' => 'Usuarios',
                'icon' => 'Users', // Lucide icon
                'date_created' => now(),
                'link' => '/configuration/users',
                'description' => 'Gestión de usuarios del sistema',
                'order' => 1,
                'is_free' => false, // No libre - requiere acceso explícito
                'user_type_id' => null,
                'is_active' => true,
            ],
        ];

        // Crear los menús
        foreach ($menus as $menuData) {
            Menu::create($menuData);
        }

        $this->command->info('Menús básicos creados exitosamente!');

        // Verificar si existe el usuario con ID 1
        $user = User::find(1);
        if (!$user) {
            $this->command->warn('Usuario con ID 1 no existe. No se puede asignar acceso al menú Usuarios.');
            return;
        }

        // Dar acceso al usuario ID 1 al menú "Usuarios" como Super Admin
        UserMenuAccess::create([
            'user_id' => 1,
            'menu_id' => 3, // Menú "Usuarios"
            'access_level' => UserMenuAccess::ACCESS_SUPER_ADMIN,
            'is_active' => true,
        ]);

        $this->command->info('Acceso asignado al usuario ID 1 para el menú Usuarios como Super Admin.');
    }
}
