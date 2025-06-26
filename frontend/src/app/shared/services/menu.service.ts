import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MenuItem } from '../interfaces/menu-item.interface';
import { ApiMenuResponse } from '../interfaces/api-menu.interface';
import { UserSettingsService } from './user-settings.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/api';
  private readonly userSettings = inject(UserSettingsService);

  // Signals
private _menuItems = signal<MenuItem[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _activeItemId = signal<string>('');
  private _expandedItems = signal<Set<string>>(new Set());

// Public computed signals
  public menuItems = this._menuItems.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();
  public activeItemId = this._activeItemId.asReadonly();
  public hasMenus = computed(() => this._menuItems().length > 0);
  public currentSearchQuery: string = '';
  private searchDebounceTimeout: any;

  // Método público para establecer los menús (usado al inicializar desde el login)
  public setMenuItems(items: MenuItem[]): void {
    this._menuItems.set(items);
  }

  public filteredMenuItems(): MenuItem[] {
    const items = this._menuItems();
    if (!this.currentSearchQuery) return items;

    const filterItems = (items: MenuItem[]): MenuItem[] => {
      return items.reduce((filtered: MenuItem[], item) => {
        const matchesSearch = (
          item.title?.toLowerCase().includes(this.currentSearchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(this.currentSearchQuery.toLowerCase())
        );

        if (item.children?.length) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length > 0) {
            filtered.push({
              ...item,
              children: filteredChildren
            });
            return filtered;
          }
        }

        if (matchesSearch) {
          filtered.push({
            ...item,
            children: item.children ? filterItems(item.children) : []
          });
        }

        return filtered;
      }, []);
    };

    return filterItems(items);
  }

public expandedItems(): Set<string> {
    return this._expandedItems();
  }

  async ensureMenusLoaded(): Promise<void> {
    console.log('🚀 Iniciando carga de menús');
    try {
      // Primero sincronizar con el servidor para obtener las preferencias más recientes
      await this.userSettings.syncWithServer();
      
      // Leer las preferencias después de sincronizar
      const preferences = this.userSettings.getAll();
      
      // Restaurar todo el estado desde las preferencias sincronizadas
      if (preferences?.searchQuery !== undefined) {
        console.log('🔍 Restaurando searchQuery:', preferences.searchQuery);
        this.currentSearchQuery = preferences.searchQuery;
      }
      
      if (preferences?.activeItem) {
        console.log('🎯 Restaurando activeItem:', preferences.activeItem);
        this._activeItemId.set(preferences.activeItem);
      }
      
      if (preferences?.expandedItems) {
        console.log('📂 Restaurando expandedItems:', preferences.expandedItems);
        this._expandedItems.set(new Set(preferences.expandedItems));
      }
    } catch (error) {
      console.error('❌ Error al sincronizar con el servidor:', error);
    }

    // Si ya tenemos menús en el servicio
    if (this.hasMenus()) {
      console.log('✅ Menús ya cargados en el servicio');
      return;
    }

    // Intentar cargar desde preferencias primero
    const preferences = this.userSettings.getAll();
    
    if (preferences?.menuItems?.length > 0) {
      console.log('✅ Cargando menús desde preferencias');
      const menuItems = this.convertApiMenusToMenuItems(preferences.menuItems);
      this._menuItems.set(menuItems);
      
      return;
    }

    // Si no hay menús en preferencias, cargar del servidor
    console.log('⚡ Cargando menús del servidor');
    await this.loadUserMenus();
    
    // Después de cargar del servidor, restaurar estado si existe
    const currentPreferences = this.userSettings.getAll();
    if (currentPreferences.activeItem) {
      console.log('🎯 Restaurando activeItem después de carga:', currentPreferences.activeItem);
      this._activeItemId.set(currentPreferences.activeItem);
    }
  }

  async loadUserMenus(): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);

      const response = await firstValueFrom(
        this.http.get<ApiMenuResponse>(`${this.apiUrl}/user/menus`, {
          withCredentials: true
        })
      );

      if (response.success) {
        const menuItems = this.convertApiMenusToMenuItems(response.data.menus);
        this._menuItems.set(menuItems);
        console.log('✅ Menús cargados exitosamente');
      } else {
        throw new Error('Error al cargar menús');
      }

    } catch (error: any) {
      console.error('❌ Error cargando menús:', error);
      this._error.set(error.message || 'Error desconocido');
      this._menuItems.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  public convertApiMenusToMenuItems(apiMenus: any[]): MenuItem[] {
    return apiMenus.map(apiMenu => ({
      id: apiMenu.id.toString(),
      title: apiMenu.name,
      description: apiMenu.description || '',
      icon: apiMenu.icon || 'FileText',
      route: apiMenu.link || undefined,
      level: 0,
children: apiMenu.children?.map((child: any) => ({
        ...this.convertApiMenusToMenuItems([child])[0],
        level: 1
      }))
    }));
  }

  setActiveItem(itemId: string): void {
    if (this._activeItemId() === itemId) return;
    this._activeItemId.set(itemId);
    console.log('🎯 Item activo establecido:', itemId);
}

  updateActiveItemByRoute(route: string): void {
    const foundItem = this.findItemByRoute(route);
    if (foundItem) {
      // Actualizar activeItem en el servicio
      this.setActiveItem(foundItem.id);
      
      // Actualizar activeItem en las preferencias
      const preferences = this.userSettings.getAll();
      preferences.activeItem = foundItem.id;
      this.userSettings.saveAll(preferences);
      
      console.log('🎯 Item activo actualizado en preferencias:', foundItem.id);
    }
  }

  toggleExpanded(itemId: string): void {
    const expandedItems = new Set(this._expandedItems());
    if (expandedItems.has(itemId)) {
      expandedItems.delete(itemId);
    } else {
      expandedItems.add(itemId);
    }
    this._expandedItems.set(expandedItems);
  
    // Actualizar expandedItems en las preferencias
    const preferences = this.userSettings.getAll();
    preferences.expandedItems = Array.from(expandedItems);
    this.userSettings.saveAll(preferences);

    console.log('🔼 Menús expandidos actualizados en preferencias:', Array.from(expandedItems));
  }

  async setSearchQuery(query: string): Promise<void> {
    // Limpiar timeout anterior si existe
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }

    // Actualizar inmediatamente para la UI
    this.currentSearchQuery = query;

    // Debounce para guardar y sincronizar
    this.searchDebounceTimeout = setTimeout(async () => {
      try {
        const preferences = this.userSettings.getAll();
        preferences.searchQuery = query;
        
        // Guardar localmente
        this.userSettings.saveAll(preferences);
        
        // Sincronizar con el servidor
        await this.userSettings.saveToServer();
        console.log('🔍 Query actualizada y sincronizada:', query);
      } catch (error) {
        console.error('❌ Error al sincronizar query:', error);
      }
    }, 300);
  }

  async clearSearch(): Promise<void> {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = null;
    }
    
    this.currentSearchQuery = '';
    
    try {
      const preferences = this.userSettings.getAll();
      preferences.searchQuery = '';
      this.userSettings.saveAll(preferences);
      await this.userSettings.saveToServer();
      console.log('🧹 Search query limpiada y sincronizada');
    } catch (error) {
      console.error('❌ Error al limpiar search query:', error);
    }
  }

  findItemByRoute(route: string): MenuItem | null {
    const findInItems = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.route === route) return item;
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInItems(this._menuItems());
  }
}
