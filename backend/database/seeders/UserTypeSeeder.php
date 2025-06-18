<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserType;
use Illuminate\Support\Facades\DB;

class UserTypeSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Solo crear si no existen registros
        if (UserType::count() > 0) {
            $this->command->info('Los tipos de usuario ya existen.');
            return;
        }
        
        $userTypes = [
            ['id' => 1, 'name' => 'AUXILIAR DE SERVICIOS Y MANTTO', 'description' => 'Personal de servicios y mantenimiento', 'is_active' => true],
            ['id' => 2, 'name' => 'ADMINISTRATIVO ESPECIALIZADO', 'description' => 'Personal administrativo especializado', 'is_active' => true],
            ['id' => 3, 'name' => 'ALMACENISTA', 'description' => 'Encargado de almacén', 'is_active' => true],
            ['id' => 4, 'name' => 'ANALISTA ESPECIALIZADO', 'description' => 'Analista especializado', 'is_active' => true],
            ['id' => 5, 'name' => 'BIBLIOTECARIO', 'description' => 'Personal de biblioteca', 'is_active' => true],
            ['id' => 6, 'name' => 'CAPTURISTA', 'description' => 'Capturista de datos', 'is_active' => true],
            ['id' => 7, 'name' => 'CHOFER', 'description' => 'Conductor de vehículos', 'is_active' => true],
            ['id' => 8, 'name' => 'COORDINADOR ADMINISTRATIVO', 'description' => 'Coordinador de área administrativa', 'is_active' => true],
            ['id' => 9, 'name' => 'COOR. DE TECNICOS ESPECIALIZADO', 'description' => 'Coordinador de técnicos especializados', 'is_active' => true],
            ['id' => 10, 'name' => 'DIBUJANTE', 'description' => 'Dibujante técnico', 'is_active' => true],
            ['id' => 11, 'name' => 'DIRECTOR DE AREA', 'description' => 'Director de área académica', 'is_active' => true],
            ['id' => 12, 'name' => 'DIRECTOR GENERAL', 'description' => 'Director general de la institución', 'is_active' => true],
            ['id' => 13, 'name' => 'DIRECTOR DE PLANTEL', 'description' => 'Director de plantel educativo', 'is_active' => true],
            ['id' => 15, 'name' => 'PROF. CECYT I', 'description' => 'Profesor CECYT nivel I', 'is_active' => true],
            ['id' => 16, 'name' => 'PROF CECYT II', 'description' => 'Profesor CECYT nivel II', 'is_active' => true],
            ['id' => 17, 'name' => 'PROF. CECYT III', 'description' => 'Profesor CECYT nivel III', 'is_active' => true],
            ['id' => 18, 'name' => 'PROF. CECYT IV', 'description' => 'Profesor CECYT nivel IV', 'is_active' => true],
            ['id' => 19, 'name' => 'ENCARGADO DE ORDEN', 'description' => 'Encargado de orden y disciplina', 'is_active' => true],
            ['id' => 20, 'name' => 'ENFERMERO', 'description' => 'Personal de enfermería', 'is_active' => true],
            ['id' => 21, 'name' => 'INGENIERO EN SISTEMAS', 'description' => 'Ingeniero en sistemas computacionales', 'is_active' => true],
            ['id' => 22, 'name' => 'JEFE DE DEPARTAMENTO', 'description' => 'Jefe de departamento', 'is_active' => true],
            ['id' => 23, 'name' => 'JEFE DE OFICINA', 'description' => 'Jefe de oficina administrativa', 'is_active' => true],
            ['id' => 24, 'name' => 'LABORATORISTA', 'description' => 'Personal de laboratorio', 'is_active' => true],
            ['id' => 25, 'name' => 'OFICIAL DE MANTENIMIENTO', 'description' => 'Oficial de mantenimiento', 'is_active' => true],
            ['id' => 26, 'name' => 'OPERADOR DE EQUIPO TIP. ESP.', 'description' => 'Operador de equipo tipográfico especializado', 'is_active' => true],
            ['id' => 27, 'name' => 'PROF. ASOCIADO B 1/2', 'description' => 'Profesor Asociado B medio tiempo', 'is_active' => true],
            ['id' => 28, 'name' => 'PROF. ASOCIADO B 3/4', 'description' => 'Profesor Asociado B tres cuartos tiempo', 'is_active' => true],
            ['id' => 30, 'name' => 'PROF. ASOCIADO C 1/2', 'description' => 'Profesor Asociado C medio tiempo', 'is_active' => true],
            ['id' => 31, 'name' => 'PROF. ASOCIADO C 3/4', 'description' => 'Profesor Asociado C tres cuartos tiempo', 'is_active' => true],
            ['id' => 33, 'name' => 'PROF. TITULAR A 1/2', 'description' => 'Profesor Titular A medio tiempo', 'is_active' => true],
            ['id' => 34, 'name' => 'PROF. TITULAR A 3/4', 'description' => 'Profesor Titular A tres cuartos tiempo', 'is_active' => true],
            ['id' => 36, 'name' => 'PROF. TITULAR B 1/2', 'description' => 'Profesor Titular B medio tiempo', 'is_active' => true],
            ['id' => 37, 'name' => 'PROF. TITULAR B 3/4', 'description' => 'Profesor Titular B tres cuartos tiempo', 'is_active' => true],
            ['id' => 39, 'name' => 'PROGRAMADOR', 'description' => 'Programador de sistemas', 'is_active' => true],
            ['id' => 40, 'name' => 'SECRETARIA DE DIRECTOR DE PLAN', 'description' => 'Secretaria de director de plantel', 'is_active' => true],
            ['id' => 41, 'name' => 'SECRETARIA DE DIRECTOR DE AREA', 'description' => 'Secretaria de director de área', 'is_active' => true],
            ['id' => 42, 'name' => 'SECRETARIA DE DIRECTOR GENERAL', 'description' => 'Secretaria de director general', 'is_active' => true],
            ['id' => 43, 'name' => 'SUBDIRECTOR DE AREA', 'description' => 'Subdirector de área', 'is_active' => true],
            ['id' => 44, 'name' => 'SUBDIRECTOR DE PLANTEL', 'description' => 'Subdirector de plantel', 'is_active' => true],
            ['id' => 45, 'name' => 'SUPERVISOR', 'description' => 'Supervisor general', 'is_active' => true],
            ['id' => 46, 'name' => 'TAQUIMECANOGRAFA', 'description' => 'Taquimecánógrafa', 'is_active' => true],
            ['id' => 47, 'name' => 'TECNICO ESPECIALIZADO', 'description' => 'Técnico especializado', 'is_active' => true],
            ['id' => 48, 'name' => 'TRABAJADOR SOCIAL', 'description' => 'Trabajador social', 'is_active' => true],
            ['id' => 49, 'name' => 'VIGILANTE', 'description' => 'Personal de vigilancia', 'is_active' => true],
            ['id' => 52, 'name' => 'PROF. ASOCIADO A 1/2', 'description' => 'Profesor Asociado A medio tiempo', 'is_active' => true],
            ['id' => 53, 'name' => 'AUXILIAR DE RESPONSABLE MOD A', 'description' => 'Auxiliar de responsable modalidad A', 'is_active' => true],
            ['id' => 54, 'name' => 'AUXILIAR DE RESPONSABLE MOD B', 'description' => 'Auxiliar de responsable modalidad B', 'is_active' => true],
            ['id' => 55, 'name' => 'AUXILIAR DE RESPONSABLE MOD C', 'description' => 'Auxiliar de responsable modalidad C', 'is_active' => true],
            ['id' => 56, 'name' => 'ENCARGADO DE CENTRO COMP MOD C', 'description' => 'Encargado de centro de cómputo modalidad C', 'is_active' => true],
            ['id' => 57, 'name' => 'ENCARGADO DE CENTRO COMP MOD B', 'description' => 'Encargado de centro de cómputo modalidad B', 'is_active' => true],
            ['id' => 58, 'name' => 'RESPONSABLE DE CENTRO MOD A', 'description' => 'Responsable de centro modalidad A', 'is_active' => true],
            ['id' => 59, 'name' => 'RESPONSABLE DE CENTRO MOD B', 'description' => 'Responsable de centro modalidad B', 'is_active' => true],
            ['id' => 60, 'name' => 'RESPONSABLE DE CENTRO MOD C', 'description' => 'Responsable de centro modalidad C', 'is_active' => true],
            ['id' => 61, 'name' => 'OFICIAL DE SERVICIOS MOD C', 'description' => 'Oficial de servicios modalidad C', 'is_active' => true],
            ['id' => 63, 'name' => 'COORDINADOR ACADEMICO', 'description' => 'Coordinador académico', 'is_active' => true],
            ['id' => 64, 'name' => 'PROFESOR TITULAR C 3/4', 'description' => 'Profesor Titular C tres cuartos tiempo', 'is_active' => true],
            ['id' => 65, 'name' => 'COORDINADOR', 'description' => 'Coordinador general', 'is_active' => true],
            ['id' => 66, 'name' => 'AUDITOR EXTERNO', 'description' => 'Auditor externo', 'is_active' => true],
            ['id' => 67, 'name' => 'PROF. EMSAD I', 'description' => 'Profesor EMSAD nivel I', 'is_active' => true],
            ['id' => 68, 'name' => 'PROF. TITULAR C 1/2', 'description' => 'Profesor Titular C medio tiempo', 'is_active' => true],
            ['id' => 69, 'name' => 'PROF. EMSAD II', 'description' => 'Profesor EMSAD nivel II', 'is_active' => true],
        ];

        foreach ($userTypes as $userType) {
            UserType::create($userType);
        }

        $this->command->info('Tipos de usuario creados exitosamente!');
    }
}
