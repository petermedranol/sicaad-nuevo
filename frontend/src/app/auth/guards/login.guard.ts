import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const loginGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthentication().pipe(
    tap(isAuthenticated => {
      if (isAuthenticated) {
        console.log('🔑 Usuario ya autenticado, redirigiendo a dashboard.');
        router.navigateByUrl('/dashboard');
      }
    }),
    // El guard debe devolver `true` para permitir el paso si NO está autenticado.
    map(isAuthenticated => !isAuthenticated)
  );
};

