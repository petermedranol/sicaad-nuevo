import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { MenuNavigationService } from '../../shared/services/menu-navigation.service';

export const loginGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthentication().pipe(
    tap(isAuthenticated => {
      if (isAuthenticated) {
        console.log('🔒 Usuario ya autenticado, redirigiendo a dashboard');
        router.navigate(['/dashboard']);
      }
    }),
    map(isAuthenticated => !isAuthenticated)
  );
};

