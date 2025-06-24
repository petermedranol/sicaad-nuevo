import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

// URLs que no deben ser interceptadas
const WHITELIST_URLS = [
  '/api/login',
  '/api/csrf-cookie',
  '/api/logout',
  '/api/user'
];

let isRedirecting = false;

export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  // Si la URL está en la lista blanca, no interceptar
  if (WHITELIST_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }
  const router = inject(Router);

  // Almacenar la ubicación actual para redirigir después del login
  const currentPath = router.url;

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<never> => {
      if ((error.status === 401 || error.status === 419) && !isRedirecting) {
        // Evitar múltiples redirecciones usando una bandera
        isRedirecting = true;
        
        // Limpiar storage y redirigir solo si no estamos ya en login
        if (!router.url.includes('/login')) {
          localStorage.clear();
          sessionStorage.clear();
          
          // Timeout para evitar posibles condiciones de carrera
          setTimeout(() => {
            router.navigate(['/login'], { 
              queryParams: { 
                sessionExpired: true,
                returnUrl: currentPath
              } 
            });
            // Resetear la bandera después de un tiempo
            setTimeout(() => {
              isRedirecting = false;
            }, 1000);
          }, 100);
        } else {
          isRedirecting = false;
        }
      }
      return throwError(() => error);
    })
  );
};
