import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { UserSettingsService } from '../shared/services/user-settings.service';

/**
 * Guard que verifica si el usuario está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const userSettings = inject(UserSettingsService);
  
  // Verificar si existe token de sesión
  const token = userSettings.get('global', 'authToken', null);
  const user = userSettings.get('global', 'user', null);
  
  if (!token || !user) {
    console.log('🚫 AuthGuard: Usuario no autenticado, redirigiendo a login');
    router.navigate(['/auth/login']);
    return false;
  }
  
  console.log('✅ AuthGuard: Usuario autenticado');
  return true;
};

