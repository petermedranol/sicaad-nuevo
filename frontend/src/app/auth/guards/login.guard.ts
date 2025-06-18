import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const loginGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkAuth();
  
  // Si ya está autenticado, redirigir al dashboard
  if (isAuth) {
    router.navigateByUrl('/dashboard');
    return false;
  }
  
  // Si no está autenticado, permitir acceso al login
  return true;
};

