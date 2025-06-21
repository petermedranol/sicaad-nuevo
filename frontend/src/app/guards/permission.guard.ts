import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { PermissionService } from '../services/permission.service';

/**
 * Guard que verifica si el usuario tiene permisos para acceder a una ruta específica
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  
  try {
    const currentUrl = state.url;
    
    console.log('🔍 PermissionGuard: Verificando acceso a:', currentUrl);
    
    // Verificar si hay menús en localStorage
    const menuData = localStorage.getItem('sicaad_menu_items');
    
    if (!menuData) {
      console.log('🚫 PermissionGuard: No hay menú disponible');
      
      // Redirigir al dashboard silentemente
      router.navigate(['/dashboard']);
      
      return false;
    }
    
    const menu = JSON.parse(menuData);
    
    // Función simple para buscar acceso
    const hasAccess = (items: any[], targetUrl: string): boolean => {
      for (const item of items) {
        // Coincidencia exacta
        if (item.route === targetUrl) {
          return true;
        }
        
        // Ruta hija
        if (item.route && targetUrl.startsWith(item.route + '/')) {
          return true;
        }
        
        // Buscar en children
        if (item.children && hasAccess(item.children, targetUrl)) {
          return true;
        }
      }
      return false;
    };
    
    if (hasAccess(menu, currentUrl)) {
      console.log('✅ PermissionGuard: Acceso permitido a', currentUrl);
      return true;
    }
    
    console.log('🚫 PermissionGuard: Sin permisos para acceder a:', currentUrl);
    console.log('📋 Menú disponible:', menu);
    
    // Redirigir al dashboard silentemente
    router.navigate(['/dashboard']);
    
    return false;
    
  } catch (error) {
    console.error('❌ PermissionGuard: Error verificando permisos:', error);
    router.navigate(['/dashboard']);
    return false;
  }
};

