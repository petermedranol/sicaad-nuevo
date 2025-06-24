import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import './config/locale.config';  // Importar configuración de locale
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { csrfInterceptor } from './interceptors/csrf.interceptor';
import { sessionExpiredInterceptor } from './interceptors/session-expired.interceptor';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      csrfInterceptor,               // Primero el CSRF interceptor
      sessionExpiredInterceptor      // Después el de sesión expirada
    ])),
    //provideClientHydration()
  ]
};
