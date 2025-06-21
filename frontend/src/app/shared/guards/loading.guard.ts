import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LoadingService } from '../services/loading.service';

export const loadingGuard: CanActivateFn = (route, state) => {
  const loadingService = inject(LoadingService);
  
  // Extraer el nombre de la ruta para el mensaje
  const routeName = getRouteDisplayName(state.url);
  
  // Mostrar loading con el nombre de la ruta
  loadingService.showNavigation(routeName);
  
  // Ocultar el loading después de un breve delay para permitir que el componente se cargue
  setTimeout(() => {
    loadingService.hide();
  }, 500);
  
  return true;
};

/**
 * Convierte la URL en un nombre amigable para mostrar
 */
function getRouteDisplayName(url: string): string {
  const routeNames: { [key: string]: string } = {
    '/configuration/users': 'Usuarios',
    '/dashboard': 'Dashboard',
    '/configuration': 'Configuración'
  };
  
  return routeNames[url] || 'Página';
}
