// src/app/app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { csrfInterceptor } from './interceptors/csrf.interceptor'; // ¡ojo el nombre!

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([csrfInterceptor]))
  ]
};
