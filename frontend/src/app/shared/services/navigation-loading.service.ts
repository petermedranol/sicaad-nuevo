import { Injectable, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoadingService {
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  
  private loadingTimeout: any = null;

  /**
   * Nombres amigables para las rutas
   */
  private routeNames: { [key: string]: string } = {
    '/configuration/users': 'Gestión de Usuarios',
    '/dashboard': 'Dashboard',
    '/configuration': 'Configuración',
    '/': 'Inicio'
  };

  constructor() {
    this.setupNavigationLoading();
  }

  /**
   * Configura el loading automático para navegación
   */
  private setupNavigationLoading(): void {
    // Detectar inicio de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.showNavigationLoading(event.url);
      });

    // Detectar fin de navegación (exitosa, cancelada o error)
    this.router.events
      .pipe(
        filter(event => 
          event instanceof NavigationEnd || 
          event instanceof NavigationCancel || 
          event instanceof NavigationError
        )
      )
      .subscribe(() => {
        this.hideNavigationLoading();
      });
  }

  /**
   * Muestra loading para navegación
   */
  private showNavigationLoading(url: string): void {
    // Limpiar timeout anterior si existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }

    // Solo mostrar loading para rutas específicas (lazy loading)
    if (this.shouldShowLoadingForRoute(url)) {
      const routeName = this.getRouteDisplayName(url);
      
      // Mostrar loading con un pequeño delay para evitar flashes en navegación rápida
      this.loadingTimeout = setTimeout(() => {
        this.loadingService.showNavigation(routeName);
      }, 100);
    }
  }

  /**
   * Oculta loading de navegación
   */
  private hideNavigationLoading(): void {
    // Limpiar timeout si está pendiente
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    // Ocultar loading con un pequeño delay para mejor UX
    setTimeout(() => {
      this.loadingService.hide();
    }, 200);
  }

  /**
   * Determina si debe mostrar loading para una ruta específica
   */
  private shouldShowLoadingForRoute(url: string): boolean {
    // Lista de rutas que usan lazy loading
    const lazyRoutes = [
      '/configuration/users',
      '/configuration'
    ];

    return lazyRoutes.some(route => url.startsWith(route));
  }

  /**
   * Convierte la URL en un nombre amigable para mostrar
   */
  private getRouteDisplayName(url: string): string {
    // Buscar coincidencia exacta primero
    if (this.routeNames[url]) {
      return this.routeNames[url];
    }

    // Buscar coincidencia parcial
    for (const [route, name] of Object.entries(this.routeNames)) {
      if (url.startsWith(route) && route !== '/') {
        return name;
      }
    }

    // Fallback: extraer nombre de la URL
    const segments = url.split('/').filter(segment => segment);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      return this.capitalize(lastSegment);
    }

    return 'Página';
  }

  /**
   * Capitaliza la primera letra de una cadena
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Agregar nueva ruta al diccionario de nombres
   */
  public addRouteName(route: string, name: string): void {
    this.routeNames[route] = name;
  }

  /**
   * Remover ruta del diccionario de nombres
   */
  public removeRouteName(route: string): void {
    delete this.routeNames[route];
  }
}

