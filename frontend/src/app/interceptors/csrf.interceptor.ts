// src/app/interceptors/csrf.interceptor.ts
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo agregar headers CSRF para requests que modifican datos
  if (shouldAddCsrfToken(req)) {
    const xsrfToken = getCookie('XSRF-TOKEN');

    if (xsrfToken) {
      req = req.clone({
        headers: req.headers
          .set('X-XSRF-TOKEN', decodeURIComponent(xsrfToken))
          .set('X-Requested-With', 'XMLHttpRequest')
      });
    }
  }

  return next(req);
};

/**
 * Determina si se debe agregar el token CSRF
 */
function shouldAddCsrfToken(req: HttpRequest<any>): boolean {
  const excludedMethods = ['GET', 'HEAD', 'OPTIONS'];
  return !excludedMethods.includes(req.method.toUpperCase());
}

/**
 * Obtiene una cookie de forma segura
 */
function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
}
