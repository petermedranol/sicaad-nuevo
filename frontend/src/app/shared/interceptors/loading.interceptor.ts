import { Injectable, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingService } from '../services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingInterceptor {
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private isNavigating = false;

  constructor() {
    this.setupNavigationLoading();
  }

  private setupNavigationLoading(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Inicio de navegación
        if (!this.isNavigating) {
          this.isNavigating = true;
          const routeName = this.getRouteNameFromUrl(event.url);
          this.loadingService.showNavigation(routeName);
        }
      } 
      else if (event instanceof NavigationEnd || 
               event instanceof NavigationCancel || 
               event instanceof NavigationError) {
        // Fin de navegación (exitosa, cancelada o con error)
        if (this.isNavigating) {
          this.isNavigating = false;
          this.loadingService.complete();
        }
      }
    });
  }

  private getRouteNameFromUrl(url: string): string {
    // Extraer nombre legible de la URL
    const cleanUrl = url.split('?')[0]; // Quitar query params
    const segments = cleanUrl.split('/').filter(segment => segment);
    
    if (segments.length === 0) return 'Inicio';
    
    const lastSegment = segments[segments.length - 1];
    
    // Mapeo de rutas a nombres legibles
    const routeNames: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'users': 'Usuarios',
      'reports': 'Reportes',
      'settings': 'Configuración',
      'profile': 'Perfil',
      'home': 'Inicio',
      'welcome': 'Bienvenida'
    };

    return routeNames[lastSegment] || this.capitalizeFirstLetter(lastSegment);
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

