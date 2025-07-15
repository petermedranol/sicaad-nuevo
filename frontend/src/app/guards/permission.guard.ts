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

    // Validar integridad de la ruta
    if (!validateRouteIntegrity(route, currentUrl)) {
      console.error('Route integrity validation failed');
      router.navigate(['/dashboard']);
      return false;
    }

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

    // Validar integridad del menú
    if (!validateMenuIntegrity(menu)) {
      console.error('Menu integrity validation failed');
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

/**
 * Valida la integridad de la ruta
 */
function validateRouteIntegrity(route: ActivatedRouteSnapshot, url: string): boolean {
  // Validar que la ruta tiene la estructura esperada
  return route &&
         typeof url === 'string' &&
         url.length > 0 &&
         (!route.data || typeof route.data === 'object');
}

/**
 * Valida la integridad del menú
 */
function validateMenuIntegrity(menu: any[]): boolean {
  if (!Array.isArray(menu)) {
    return false;
  }

  return menu.every(item =>
    item &&
    typeof item === 'object' &&
    (typeof item.id === 'string' || typeof item.id === 'number') &&
    typeof item.title === 'string' &&
    (typeof item.route === 'string' || item.route === null || item.route === undefined) &&
    (typeof item.link === 'string' || item.link === null || item.link === undefined) &&
    (!item.children || Array.isArray(item.children))
  );
}

/**
 * Valida un item del menú
 */
function validateMenuItem(item: any): boolean {
  if (!item || typeof item !== 'object') {
    return false;
  }

  // Validar propiedades requeridas
  if (typeof item.id !== 'string' && typeof item.id !== 'number') {
    return false;
  }

  if (typeof item.title !== 'string') {
    return false;
  }

  // Validar ruta si existe
  if (item.route !== null && item.route !== undefined && typeof item.route !== 'string') {
    return false;
  }

  // Validar children si existen
  if (item.children && !Array.isArray(item.children)) {
    return false;
  }

  if (item.children) {
    return item.children.every((child: any) => validateMenuItem(child));
  }

  return true;
}

