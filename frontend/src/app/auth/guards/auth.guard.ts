import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthentication().pipe(
    tap(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('🚫 Acceso denegado por AuthGuard, redirigiendo a login.');
        router.navigateByUrl('/auth/login');
      }
    }),
    map(isAuthenticated => isAuthenticated) // Asegura que el observable emita el booleano
  );
};
