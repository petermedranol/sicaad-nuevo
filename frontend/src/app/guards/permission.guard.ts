import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { PermissionService } from '../shared/services/permission.service';
import { UserSettingsService } from '../shared/services/user-settings.service';

/**
 * Guard que verifica si el usuario tiene permisos para acceder a una ruta específica
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  try {
    const currentUrl = state.url;

    // Rutas siempre permitidas
    const publicRoutes = ['/dashboard', '/profile'];
    if (publicRoutes.includes(currentUrl)) {
      console.log('✅ Acceso permitido a ruta pública:', currentUrl);
      return true;
    }

    const userSettings = inject(UserSettingsService);
    
    // Obtener toda la configuración del usuario
    const settings = userSettings.getAll();
    const menu = settings.menuItems;

    if (!menu || !Array.isArray(menu)) {
      console.log('❌ No hay menús cargados, redirigiendo a dashboard');
      router.navigate(['/dashboard']);
      return false;
    }

    // Función mejorada para buscar acceso
    const hasAccess = (items: any[], targetUrl: string): boolean => {
      for (const item of items) {
        // Coincidencia exacta
        if (item.route === targetUrl) {
          console.log('✅ Acceso permitido - coincidencia exacta:', targetUrl);
          return true;
        }

        // Ruta hija (permitir acceso a subrutas)
        if (item.route && targetUrl.startsWith(item.route + '/')) {
          console.log('✅ Acceso permitido - subruta de:', item.route);
          return true;
        }

        // Buscar en children
        if (item.children && hasAccess(item.children, targetUrl)) {
          return true;
        }
      }
      return false;
    };

    const access = hasAccess(menu, currentUrl);
    
    if (!access) {
      console.log('❌ Acceso denegado a:', currentUrl);
      console.log('📄 Menús disponibles:', menu);
      router.navigate(['/dashboard']);
    }

    return access;

  } catch (error) {
    router.navigate(['/dashboard']);
    return false;
  }
};

