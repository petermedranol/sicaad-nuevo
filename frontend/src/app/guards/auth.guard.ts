import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

/**
 * Guard que verifica si el usuario está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Verificar si existe token de sesión
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    console.log('🚫 AuthGuard: Usuario no autenticado, redirigiendo a login');
    router.navigate(['/auth/login']);
    return false;
  }
  
  console.log('✅ AuthGuard: Usuario autenticado');
  return true;
};

