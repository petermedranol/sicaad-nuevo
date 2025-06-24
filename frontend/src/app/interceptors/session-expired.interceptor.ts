import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 419) {
        localStorage.clear();
        sessionStorage.clear();
        router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      }
      throw error;
    })
  );
};
