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
  private searchDebounceTimeout?: any;

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
    try {
      // Primero sincronizar con el servidor para obtener las preferencias más recientes
      await this.userSettings.syncWithServer();

      // Leer las preferencias después de sincronizar
      const preferences = this.userSettings.getAll();

      // Restaurar todo el estado desde las preferencias sincronizadas
      if (preferences?.searchQuery !== undefined) {
        this.currentSearchQuery = preferences.searchQuery;
      }

      if (preferences?.activeItem) {
        this._activeItemId.set(preferences.activeItem);
      }

      if (preferences?.expandedItems) {
        this._expandedItems.set(new Set(preferences.expandedItems));
      }
    } catch (error) {
    }

    // Si ya tenemos menús en el servicio
    if (this.hasMenus()) {
      return;
    }

    // Intentar cargar desde preferencias primero
    const preferences = this.userSettings.getAll();

    if (preferences?.menuItems?.length > 0) {
      const menuItems = this.convertApiMenusToMenuItems(preferences.menuItems);
      this._menuItems.set(menuItems);

      return;
    }

    // Si no hay menús en preferencias, cargar del servidor
    await this.loadUserMenus();

    // Después de cargar del servidor, restaurar estado si existe
    const currentPreferences = this.userSettings.getAll();
    if (currentPreferences.activeItem) {
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
      } else {
        throw new Error('Error al cargar menús');
      }

    } catch (error: any) {
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
}

  updateActiveItemByRoute(route: string): void {
    const found = this.findItemByRoute(route);
    if (found) {
      // Actualizar activeItem en el servicio
      this.setActiveItem(found.item.id);

      // Expandir automáticamente los menús padres
      const expandedItems = new Set(this._expandedItems());
      found.parents.forEach(parent => {
        if (!expandedItems.has(parent.id)) {
          expandedItems.add(parent.id);
        }
      });
      this._expandedItems.set(expandedItems);

      // Actualizar preferencias
      const preferences = this.userSettings.getAll();
      preferences.activeItem = found.item.id;
      preferences.expandedItems = Array.from(expandedItems);
      this.userSettings.saveAll(preferences);

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
      } catch (error) {
      }
    }, 300);
  }

  private clearDebounceTimeout() {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = undefined;
    }
  }

  async clearSearch(): Promise<void> {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = undefined;
    }

    this.currentSearchQuery = '';

    try {
      const preferences = this.userSettings.getAll();
      preferences.searchQuery = '';
      this.userSettings.saveAll(preferences);
      await this.userSettings.saveToServer();
    } catch (error) {
    }
  }

  findItemByRoute(route: string): { item: MenuItem, parents: MenuItem[] } | null {
    // Normalizar la ruta
    const normalizedRoute = route === '/' ? '' : route;

    const findInItems = (items: MenuItem[], parents: MenuItem[] = []): { item: MenuItem, parents: MenuItem[] } | null => {
      for (const item of items) {
        // Comparar con la ruta normalizada
        if (item.route === normalizedRoute) return { item, parents };
        if (item.children) {
          const found = findInItems(item.children, [...parents, item]);
          if (found) return found;
        }
      }
      return null;
    };

    return findInItems(this._menuItems());
  }
}
