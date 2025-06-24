import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { csrfInterceptor } from './interceptors/csrf.interceptor';
import { sessionExpiredInterceptor } from './interceptors/session-expired.interceptor';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      csrfInterceptor,               // Primero el CSRF interceptor
      sessionExpiredInterceptor      // Después el de sesión expirada
    ])),
    //provideClientHydration()
  ]
};
