import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { PermissionService } from '../shared/services/permission.service';
import { UserSettingsService } from '../shared/services/user-settings.service';
import { MenuService } from '../shared/services/menu.service';
import { AuthService } from '../auth/services/auth.service';

/**
 * Guard que verifica si el usuario tiene permisos para acceder a una ruta específica
 */
export const permissionGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const menuService = inject(MenuService);

  try {
    const currentUrl = state.url;

    // Rutas siempre permitidas
    const publicRoutes = ['/dashboard', '/profile'];
    if (publicRoutes.includes(currentUrl)) {
      return true;
    }

    // Cargar menús (desde preferencias o servidor si es necesario)
    await menuService.ensureMenusLoaded();

    const menu = menuService.menuItems();
    if (!menu || !Array.isArray(menu) || menu.length === 0) {
      router.navigate(['/dashboard']);
      return false;
    }
    // Función mejorada para buscar acceso
    const hasAccess = (items: any[], targetUrl: string): boolean => {
      for (const item of items) {
        const itemRoute = item.link || item.route;

        // Coincidencia exacta
        if (itemRoute === targetUrl) {
          return true;
        }

        // Ruta hija (permitir acceso a subrutas)
        if (itemRoute && targetUrl.startsWith(itemRoute + '/')) {
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
      router.navigate(['/dashboard']);
    }

    return access;

  } catch (error) {
    router.navigate(['/dashboard']);
    return false;
  }
};

