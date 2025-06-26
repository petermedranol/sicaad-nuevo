import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from './menu.service';
import { UserSettingsService } from './user-settings.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuNavigationService implements OnDestroy {
  private router = inject(Router);
  private menuService = inject(MenuService);
  private userSettings = inject(UserSettingsService);
  private lastNavigation: string | null = null;
  private navigationSubscription: Subscription;

  constructor() {
    // Monitorear eventos de navegación
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log('🚀 Navegación completada a:', event.url);
    });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  /**
   * Navega al último componente activo guardado en las preferencias
   */
  async navigateToLastActiveItem(): Promise<boolean> {
    try {
      // No navegar si ya estamos en una ruta específica diferente a dashboard
      if (this.router.url !== '/dashboard' && this.router.url !== '/') {
        console.log('📍 Ya estamos en una ruta válida:', this.router.url);
        return true;
      }

      const settings = this.userSettings.getAll();
      const activeItemId = settings.activeItem;
      const menuItems = settings.menuItems;
      
      if (!activeItemId || !menuItems) {
        console.log('⚠️ No hay item activo o menús en preferencias');
        return this.router.navigate(['/dashboard']);
      }

      console.log('🔍 Buscando ruta para el item:', activeItemId);
      
      // Función recursiva para buscar el item por ID
      const findItemById = (items: any[], targetId: string): any => {
        for (const item of items) {
          if (item.id.toString() === targetId.toString()) return item;
          if (item.children) {
            const found = findItemById(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const foundItem = findItemById(menuItems, activeItemId);
      
      if (foundItem?.route) {
        console.log('🎯 Navegando a ruta:', foundItem.route);
        return this.router.navigate([foundItem.route]);
      } else {
        console.log('⚠️ No se encontró la ruta para el item:', activeItemId);
        return this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('❌ Error durante la navegación:', error);
      return this.router.navigate(['/dashboard']);
    }
  }
}
