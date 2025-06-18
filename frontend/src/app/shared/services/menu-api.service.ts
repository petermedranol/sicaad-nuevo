import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MenuItem } from '../interfaces/menu-item.interface';
import { ApiMenuResponse, ApiMenuItem, MenuAccessResponse } from '../interfaces/api-menu.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/api';
  
  // Signal para los menús cargados desde el backend
  private _menuItems = signal<MenuItem[]>([]);
  public menuItems = this._menuItems.asReadonly();
  
  // Signal para items expandidos
  private _expandedItems = signal<Set<string>>(new Set<string>());
  public expandedItems = this._expandedItems.asReadonly();
  
  // Signal para el item activo
  private _activeItemId = signal<string>('dashboard');
  public activeItemId = this._activeItemId.asReadonly();
  
  // Signal para el loading
  private _loading = signal<boolean>(false);
  public loading = this._loading.asReadonly();
  
  // Signal para errores
  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();
  
  // Signal para información del usuario
  private _userInfo = signal<any>(null);
  public userInfo = this._userInfo.asReadonly();
  
  // Computed para verificar si hay menús cargados
  public hasMenus = computed(() => this._menuItems().length > 0);
  
  constructor() {
    console.log('🔧 MenuApiService iniciado con API backend');
  }

  /**
   * Carga los menús del usuario desde el backend
   */
  async loadUserMenus(): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);
      
      console.log('🌐 Cargando menús del usuario desde backend...');
      
      const response = await firstValueFrom(
        this.http.get<ApiMenuResponse>(`${this.apiUrl}/user/menus`, { 
          withCredentials: true 
        })
      );

      if (response.success) {
        // Convertir los menús de la API al formato interno
        const menuItems = this.convertApiMenusToMenuItems(response.data.menus);
        
        this._menuItems.set(menuItems);
        this._userInfo.set(response.data.user_info);
        
        console.log('✅ Menús cargados exitosamente:', menuItems.length, 'elementos');
        console.log('👤 Info usuario:', response.data.user_info);
        
      } else {
        throw new Error(response.message || 'Error al cargar menús');
      }
      
    } catch (error: any) {
      console.error('❌ Error cargando menús:', error);
      this._error.set(error.message || 'Error desconocido');
      
      // Fallback a menús por defecto o vacío
      this._menuItems.set([]);
      
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Convierte los menús de la API al formato interno MenuItem
   */
  private convertApiMenusToMenuItems(apiMenus: ApiMenuItem[]): MenuItem[] {
    return apiMenus.map(apiMenu => this.convertApiMenuToMenuItem(apiMenu));
  }

  /**
   * Convierte un menú de la API al formato MenuItem
   */
  private convertApiMenuToMenuItem(apiMenu: ApiMenuItem): MenuItem {
    return {
      id: apiMenu.id.toString(),
      title: apiMenu.name,
      description: apiMenu.description || '',
      icon: apiMenu.icon || 'FileText',
      route: apiMenu.link || undefined,
      level: 0, // Se calculará si es necesario
      children: apiMenu.children.length > 0 
        ? apiMenu.children.map(child => ({
            ...this.convertApiMenuToMenuItem(child),
            level: 1
          }))
        : undefined
    };
  }

  /**
   * Verifica el nivel de acceso del usuario a un menú específico
   */
  async checkMenuAccess(menuId: number): Promise<MenuAccessResponse | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<MenuAccessResponse>(`${this.apiUrl}/user/menu/${menuId}/access`, {
          withCredentials: true
        })
      );

      return response;
      
    } catch (error: any) {
      console.error('❌ Error verificando acceso al menú:', error);
      return null;
    }
  }

  /**
   * Expande o contrae un elemento del menú 
   */
  toggleExpanded(itemId: string): void {
    const currentExpanded = new Set(this._expandedItems());
    
    if (currentExpanded.has(itemId)) {
      currentExpanded.delete(itemId);
      console.log('📁 Contrayendo item:', itemId);
    } else {
      currentExpanded.add(itemId);
      console.log('📂 Expandiendo item:', itemId);
    }
    
    this._expandedItems.set(currentExpanded);
  }

  /**
   * Verifica si un elemento está expandido
   */
  isExpanded(itemId: string): boolean {
    return this._expandedItems().has(itemId);
  }

  /**
   * Establece el elemento activo
   */
  setActiveItem(itemId: string): void {
    this._activeItemId.set(itemId);
    console.log('🎯 Item activo establecido:', itemId);
  }

  /**
   * Busca un elemento por su ruta
   */
  findItemByRoute(route: string): MenuItem | null {
    const findInItems = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.route === route) {
          return item;
        }
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findInItems(this._menuItems());
  }

  /**
   * Actualiza el elemento activo basado en la ruta actual
   */
  updateActiveItemByRoute(currentRoute: string): void {
    const item = this.findItemByRoute(currentRoute);
    if (item) {
      this.setActiveItem(item.id);
    }
  }

  /**
   * Expande automáticamente los padres de un elemento dado
   */
  expandParentsOfItem(itemId: string): void {
    const expandParents = (items: MenuItem[], targetId: string, currentPath: string[] = []): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item.id];
        
        if (item.id === targetId) {
          // Encontramos el item, expandir todos los padres en el path
          currentPath.forEach(parentId => {
            const currentExpanded = new Set(this._expandedItems());
            currentExpanded.add(parentId);
            this._expandedItems.set(currentExpanded);
          });
          return true;
        }
        
        if (item.children && expandParents(item.children, targetId, newPath)) {
          return true;
        }
      }
      return false;
    };
    
    expandParents(this._menuItems(), itemId);
  }

  /**
   * Limpia todos los datos (útil para logout)
   */
  clearMenus(): void {
    this._menuItems.set([]);
    this._userInfo.set(null);
    this._expandedItems.set(new Set<string>());
    this._activeItemId.set('dashboard');
    this._error.set(null);
    console.log('🧹 Menús limpiados');
  }
}

