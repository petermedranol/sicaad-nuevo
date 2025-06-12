// src/app/interceptors/csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const xsrfToken = getCookie('XSRF-TOKEN');

  if (xsrfToken) {
    req = req.clone({
      headers: req.headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfToken))
    });
  }

  return next(req);
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}
