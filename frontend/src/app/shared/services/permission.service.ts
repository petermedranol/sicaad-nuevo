import { Injectable, signal } from '@angular/core';
import { MenuItem } from '../interfaces/menu-item.interface';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userMenu = signal<MenuItem[]>([]);
  
  constructor() {
    this.loadUserMenu();
  }
  
  /**
   * Carga el menú del usuario desde localStorage
   */
  private loadUserMenu() {
    try {
      // Intentar primero la clave que usa MenuService
      let menuData = localStorage.getItem('sicaad_menu_items');
      
      // Fallback a la clave alternativa
      if (!menuData) {
        menuData = localStorage.getItem('userMenu');
      }
      
      if (menuData) {
        const menu: MenuItem[] = JSON.parse(menuData);
        this.userMenu.set(menu);
        console.log('📋 PermissionService: Menú cargado', menu);
      } else {
        console.log('📋 PermissionService: No hay menú en localStorage');
      }
    } catch (error) {
      console.error('❌ PermissionService: Error cargando menú', error);
      this.userMenu.set([]);
    }
  }
  
  /**
   * Recarga el menú desde localStorage
   */
  reloadMenu() {
    this.loadUserMenu();
  }
  
  /**
   * Verifica si el usuario tiene acceso a una ruta específica
   */
  hasAccessToRoute(targetRoute: string): boolean {
    const menu = this.userMenu();
    
    if (!menu || menu.length === 0) {
      console.log('🚫 PermissionService: No hay menú disponible');
      return false;
    }
    
    // Rutas base siempre permitidas
    const allowedBaseRoutes = ['/dashboard', '/profile'];
    if (allowedBaseRoutes.includes(targetRoute)) {
      return true;
    }
    
    return this.searchRouteInMenu(menu, targetRoute);
  }
  
  /**
   * Búsqueda recursiva de ruta en el menú
   */
  private searchRouteInMenu(items: MenuItem[], targetRoute: string): boolean {
    for (const item of items) {
      // Coincidencia exacta
      if (item.route === targetRoute) {
        return true;
      }
      
      // Ruta hija (ej: /configuration/users dentro de /configuration)
      if (item.route && targetRoute.startsWith(item.route + '/')) {
        return true;
      }
      
      // Buscar en children
      if (item.children && this.searchRouteInMenu(item.children, targetRoute)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Obtiene todas las rutas permitidas para el usuario
   */
  getAllowedRoutes(): string[] {
    const menu = this.userMenu();
    const routes: string[] = [];
    
    this.extractRoutes(menu, routes);
    
    // Agregar rutas base
    routes.push('/dashboard', '/profile');
    
    return routes;
  }
  
  /**
   * Extrae recursivamente todas las rutas del menú
   */
  private extractRoutes(items: MenuItem[], routes: string[]) {
    for (const item of items) {
      if (item.route) {
        routes.push(item.route);
      }
      
      if (item.children) {
        this.extractRoutes(item.children, routes);
      }
    }
  }
  
  /**
   * Verifica si el usuario tiene acceso a un módulo específico
   */
  hasAccessToModule(moduleName: string): boolean {
    const menu = this.userMenu();
    return menu.some(item => 
      item.title.toLowerCase().includes(moduleName.toLowerCase()) ||
      (item.route && item.route.includes(moduleName.toLowerCase()))
    );
  }
  
  /**
   * Obtiene información del menú del usuario
   */
  getUserMenu() {
    return this.userMenu();
  }
  
  /**
   * Verifica si el usuario es administrador (basado en el menú)
   */
  isAdmin(): boolean {
    return this.hasAccessToModule('configuración') || this.hasAccessToModule('usuarios');
  }
  
  /**
   * Logs para debugging
   */
  debugPermissions(route: string) {
    console.log('🔍 PermissionService Debug:');
    console.log('- Ruta solicitada:', route);
    console.log('- Menú disponible:', this.userMenu());
    console.log('- Tiene acceso:', this.hasAccessToRoute(route));
    console.log('- Rutas permitidas:', this.getAllowedRoutes());
  }
}

