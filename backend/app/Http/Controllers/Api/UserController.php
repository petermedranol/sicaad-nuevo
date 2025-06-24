<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Lista usuarios con paginación y filtros server-side
     */
    public function index(Request $request): JsonResponse
    {

        

        try {
            // Validar parámetros de entrada
            $validated = $request->validate([
                'page' => 'integer|min:1',
                'limit' => 'integer|min:1|max:100',
                'search' => 'string|nullable',
                'sortField' => 'string|in:id,name,email,created_at',
                'sortOrder' => 'string|in:ASC,DESC'
            ]);

            // Parámetros con valores por defecto
            $page = $validated['page'] ?? 1;
            $limit = $validated['limit'] ?? 10;
            $search = $validated['search'] ?? '';
            $sortField = $validated['sortField'] ?? 'name';
            $sortOrder = $validated['sortOrder'] ?? 'ASC';

            // Query base
            $query = User::query();

            // Aplicar búsqueda si existe
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('id', 'LIKE', "%{$search}%");
                });
            }

            // Aplicar ordenamiento
            $query->orderBy($sortField, $sortOrder);

            // Ejecutar paginación
            $paginated = $query->paginate($limit, ['id', 'name', 'email', 'created_at', 'updated_at'], 'page', $page);

            // Formatear usuarios para el frontend
            $users = $paginated->getCollection()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->toISOString(),
                    'updated_at' => $user->updated_at->toISOString(),
                    'formatted_date' => $user->created_at->format('d/m/Y')
                ];
            });

            // Información de paginación
            $pagination = [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total_records' => $paginated->total(),
                'total_pages' => $paginated->lastPage(),
                'has_next_page' => $paginated->hasMorePages(),
                'has_previous_page' => $paginated->currentPage() > 1,
                'from' => $paginated->firstItem() ?? 0,
                'to' => $paginated->lastItem() ?? 0
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users,
                    'pagination' => $pagination,
                    'filters' => [
                        'search' => $search,
                        'sort_field' => $sortField,
                        'sort_order' => $sortOrder
                    ]
                ],
                'message' => 'Usuarios obtenidos exitosamente'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Parámetros inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Error en UserController@index: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => 'INTERNAL_ERROR'
            ], 500);
        }
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validar datos de entrada
            $validated = $request->validate([
                'name' => 'required|string|min:2|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required|string|min:8'
            ], [
                'name.required' => 'El nombre es requerido',
                'name.min' => 'El nombre debe tener al menos 2 caracteres',
                'email.required' => 'El email es requerido',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado',
                'password.required' => 'La contraseña es requerida',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'password_confirmation.required' => 'La confirmación de contraseña es requerida'
            ]);

            // Crear el usuario
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'email_verified_at' => now() // Auto-verificar email para usuarios creados por admin
            ]);

            // Formatear respuesta
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
                'formatted_date' => $user->created_at->format('d/m/Y')
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $userData
                ],
                'message' => 'Usuario creado exitosamente'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Error creando usuario: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al crear usuario',
                'error' => 'CREATION_ERROR'
            ], 500);
        }
    }

    /**
     * Mostrar un usuario específico
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->toISOString(),
                    'updated_at' => $user->updated_at->toISOString(),
                    'formatted_date' => $user->created_at->format('d/m/Y')
                ]
            ],
            'message' => 'Usuario obtenido exitosamente'
        ]);
    }

    /**
     * Actualizar un usuario
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            // Reglas de validación dinámicas
            $rules = [
                'name' => 'required|string|min:2|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
            ];

            // Solo validar contraseña si se proporciona
            if ($request->filled('password')) {
                $rules['password'] = 'required|string|min:8|confirmed';
                $rules['password_confirmation'] = 'required|string|min:8';
            }

            // Validar datos de entrada
            $validated = $request->validate($rules, [
                'name.required' => 'El nombre es requerido',
                'name.min' => 'El nombre debe tener al menos 2 caracteres',
                'email.required' => 'El email es requerido',
                'email.email' => 'El email debe tener un formato válido',
                'email.unique' => 'Este email ya está registrado por otro usuario',
                'password.required' => 'La contraseña es requerida',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'password.confirmed' => 'Las contraseñas no coinciden',
                'password_confirmation.required' => 'La confirmación de contraseña es requerida'
            ]);

            // Preparar datos para actualizar
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];

            // Solo actualizar contraseña si se proporcionó
            if ($request->filled('password')) {
                $updateData['password'] = bcrypt($validated['password']);
            }

            // Actualizar el usuario
            $user->update($updateData);

            // Refrescar datos del usuario
            $user->refresh();

            // Formatear respuesta
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
                'formatted_date' => $user->created_at->format('d/m/Y')
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $userData
                ],
                'message' => 'Usuario actualizado exitosamente'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Error actualizando usuario: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al actualizar usuario',
                'error' => 'UPDATE_ERROR'
            ], 500);
        }
    }

    /**
     * Eliminar un usuario
     */
    public function destroy(User $user): JsonResponse
    {
        // TODO: Implementar eliminación de usuario
        return response()->json([
            'success' => false,
            'message' => 'Método no implementado aún'
        ], 501);
    }
}
