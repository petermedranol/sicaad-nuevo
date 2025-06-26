import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MenuItem } from '../interfaces/menu-item.interface';
import { ApiMenuResponse, ApiMenuItem, MenuAccessResponse } from '../interfaces/api-menu.interface';
import { UserSettingsService } from './user-settings.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/api';

  private readonly userSettings = inject(UserSettingsService);
  private readonly userId = 'global';  // Usamos 'global' para configuraciones globales

  // Tiempo de caché en milisegundos (30 minutos)
  private readonly CACHE_DURATION = 30 * 60 * 1000;

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

  // Signal para la búsqueda
  private _searchQuery = signal<string>('');
  public searchQuery = this._searchQuery.asReadonly();

  // Getter para compatibilidad con componentes existentes
  public get currentSearchQuery(): string {
    return this._searchQuery();
  }

  // Computed para verificar si hay menús cargados
  public hasMenus = computed(() => this._menuItems().length > 0);

  // Computed para menús filtrados
  public filteredMenuItems = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    if (!query) {
      return this._menuItems();
    }

    return this.filterMenuItemsWithParents(this._menuItems(), query);
  });

  constructor() {
    // Cargar datos persistidos al inicializar
    this.loadFromStorage();
  }

  /**
   * Carga los menús del usuario desde el backend
   */
  async loadUserMenus(): Promise<void> {
    try {
      console.log('🚨 INICIO loadUserMenus() - MÉTODO LLAMADO');
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

        // Guardar todo en un solo objeto de configuración
        const settings = {
          menuItems: menuItems,
          userInfo: response.data.user_info,
          expandedItems: Array.from(this._expandedItems()),
          activeItem: this._activeItemId(),
          searchQuery: this._searchQuery(),
          lastSync: Date.now().toString()
        };

        // Actualizar signals locales
        this._menuItems.set(menuItems);
        this._userInfo.set(response.data.user_info);

        // Guardar todo de una vez en localStorage
        this.userSettings.saveAll(settings);

        console.log('💾 Menús guardados:', menuItems);
      } else {
        throw new Error(response.message || 'Error al cargar menús');
      }

    } catch (error: any) {
      console.error('❌ Error cargando menús:', error);
      this._error.set(error.message || 'Error desconocido');

      // Fallback a menús por defecto si es necesario
      this.loadFallbackMenus();

    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Carga menús de fallback en caso de error
   */
  private loadFallbackMenus(): void {
    const fallbackMenus: MenuItem[] = [
      {
        id: 'dashboard',
        title: 'Inicio',
        description: 'Página de inicio',
        icon: 'Home',
        route: '/dashboard',
        level: 0
      }
    ];

    this._menuItems.set(fallbackMenus);
    console.log('⚠️ Menús de fallback cargados');
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
   * Filtra los elementos del menú manteniendo la jerarquía de padres
   */
  private filterMenuItemsWithParents(items: MenuItem[], query: string): MenuItem[] {
    const filteredItems: MenuItem[] = [];

    for (const item of items) {
      // Verificar si el item actual coincide
      const itemMatches = this.itemMatchesQuery(item, query);

      // Verificar hijos recursivamente
      const filteredChildren = item.children
        ? this.filterMenuItemsWithParents(item.children, query)
        : [];

      // Si el item coincide o tiene hijos que coinciden, incluirlo
      if (itemMatches || filteredChildren.length > 0) {
        filteredItems.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children
        });
      }
    }

    return filteredItems;
  }

  /**
   * Verifica si un item coincide con la query de búsqueda
   */
  private itemMatchesQuery(item: MenuItem, query: string): boolean {
    return item.title.toLowerCase().includes(query) ||
           (item.description?.toLowerCase().includes(query) || false);
  }

  /**
   * Establece la query de búsqueda
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
    this.saveToStorage();
    console.log('🔍 Query de búsqueda:', query);
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this._searchQuery.set('');
    this.saveToStorage();
    console.log('🧹 Búsqueda limpiada');
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
    this.saveToStorage();
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
    this.saveToStorage();
    
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
    this._searchQuery.set('');
    this.clearStorage();
    console.log('🧹 Menús limpiados');
  }

  // ========== MÉTODOS DE PERSISTENCIA ==========

  /**
   * Guarda todos los datos del menú en localStorage
   */
  private saveToStorage(): void {
    try {
      // Crear un objeto con todas las configuraciones actuales
      const currentSettings = {
        menuItems: this._menuItems(),
        userInfo: this._userInfo(),
        expandedItems: Array.from(this._expandedItems()),
        activeItem: this._activeItemId(),
        searchQuery: this._searchQuery(),
        lastSync: Date.now().toString()
      };
      
      // Guardar todas las configuraciones de una vez
      this.userSettings.saveAll(currentSettings);

    } catch (error) {
      console.error('❌ Error guardando configuraciones:', error);
    }
  }

  /**
   * Carga todos los datos del menú desde localStorage
   */
  private loadFromStorage(): void {
    try {
      // Verificar si los datos en cache están vigentes
      const lastSync = this.userSettings.get('lastSync', null);
      if (lastSync) {
        const lastSyncTime = parseInt(lastSync);
        const now = Date.now();
        if (now - lastSyncTime > this.CACHE_DURATION) {
          console.log('⏰ Cache expirado, se requerirá nueva carga desde el backend');
          this.clearStorage();
          return;
        }
      }

      // Cargar menús
      const menuItems = this.userSettings.get('menuItems', null);
      if (menuItems) {
        this._menuItems.set(menuItems);
      }

      // Cargar información de usuario
      const userInfo = this.userSettings.get('userInfo', null);
      if (userInfo) {
        this._userInfo.set(userInfo);
      }

      // Cargar items expandidos (convertir Array a Set)
      const expandedArray = this.userSettings.get('expandedItems', []);
      if (expandedArray) {
        this._expandedItems.set(new Set(expandedArray));
      }

      // Cargar item activo
      const activeItem = this.userSettings.get('activeItem', 'dashboard');
      if (activeItem) {
        this._activeItemId.set(activeItem);
      }

      // Cargar query de búsqueda
      const searchQuery = this.userSettings.get('searchQuery', '');
      if (searchQuery) {
        this._searchQuery.set(searchQuery);
        console.log('🔍 Query de búsqueda cargada:', searchQuery);
      }

    } catch (error) {
      console.warn('⚠️ Error cargando configuraciones:', error);
      this.clearStorage();
    }
  }

  /**
   * Limpia todos los datos del localStorage
   */
  private clearStorage(): void {
    try {
      // Crear un objeto con todas las configuraciones en null
      const emptySettings = {
        menuItems: null,
        userInfo: null,
        expandedItems: null,
        activeItem: null,
        searchQuery: null,
        lastSync: null
      };
      
      // Guardar todas las configuraciones de una vez
      this.userSettings.saveAll(emptySettings);

      console.log('🗑️ Configuraciones limpiadas');
    } catch (error) {
      console.warn('⚠️ Error limpiando configuraciones:', error);
    }
  }

  /**
   * Verifica si hay datos válidos en cache
   */
  private hasCachedData(): boolean {
    try {
      const menuItems = this.userSettings.get('menuItems', null);
      const lastSync = this.userSettings.get('lastSync', null);

      if (!menuItems || !lastSync) return false;

      const lastSyncTime = parseInt(lastSync);
      const now = Date.now();

      return (now - lastSyncTime) <= this.CACHE_DURATION;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sincroniza datos con localStorage (llamar después de cambios importantes)
   */
  public syncToStorage(): void {
    this.saveToStorage();
  }

  /**
   * Verifica el acceso a un menú con validación de backend
   */
  async validateMenuAccess(menuId: string): Promise<boolean> {
    try {
      // Primero verificar en localStorage/cache
      const cachedMenus = this._menuItems();
      const menuExists = this.findItemById(cachedMenus, menuId);

      if (!menuExists) {
        console.log('🚫 Menú no encontrado en cache:', menuId);
        return false;
      }

      // Si tenemos datos recientes en cache, confiar en ellos
      if (this.hasCachedData()) {
        console.log('✅ Acceso validado desde cache para menú:', menuId);
        return true;
      }

      // Si el cache está expirado, validar con el backend
      const numericMenuId = parseInt(menuId);
      if (!isNaN(numericMenuId)) {
        const accessResponse = await this.checkMenuAccess(numericMenuId);
        return accessResponse?.success === true && accessResponse?.data?.has_access === true;
      }

      return true; // Por defecto permitir acceso si no se puede validar
    } catch (error) {
      console.warn('⚠️ Error validando acceso al menú:', error);
      return true; // En caso de error, permitir acceso
    }
  }

  /**
   * Busca un item por ID recursivamente
   */
  private findItemById(items: MenuItem[], id: string): MenuItem | null {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = this.findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Recarga menús solo si es necesario (cache expirado o no existe)
   */
  async reloadMenusIfNeeded(): Promise<void> {
    // Si no hay menús o el cache está expirado, recargar
    if (!this.hasMenus() || !this.hasCachedData()) {
      console.log('🔄 Recargando menús porque el cache está expirado o vacío');
      await this.loadUserMenus();
    } else {

    }
  }

  /**
   * Método para uso desde el dashboard - verifica y recarga si es necesario
   */
  async ensureMenusLoaded(): Promise<void> {
    await this.reloadMenusIfNeeded();
  }

  /**
   * Método temporal para forzar recarga de menús (para desarrollo)
   */
  forceReloadMenus(): void {
    this.clearStorage();
    this.loadUserMenus();
    console.log('🔄 Menús forzados a recargar desde servidor');
  }
}

