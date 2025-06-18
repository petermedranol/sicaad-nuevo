import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MenuItem } from '../interfaces/menu-item.interface';
import { ApiMenuResponse, ApiMenuItem, MenuAccessResponse } from '../interfaces/api-menu.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
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
    console.log('🔧 MenuService iniciado con API backend');
  }
  
  // Signal privado para los elementos del menú
  private _menuItems = signal<MenuItem[]>([]);
  
  // Signal público de solo lectura
  public menuItems = this._menuItems.asReadonly();
  
  // Signal para items expandidos
  private _expandedItems = signal<Set<string>>(new Set<string>());
  public expandedItems = this._expandedItems.asReadonly();
  
  // Signal para el item activo
  private _activeItemId = signal<string>('dashboard');
  public activeItemId = this._activeItemId.asReadonly();
  
  // Signal para la búsqueda
  private _searchQuery = signal<string>('');
  public searchQuery = this._searchQuery.asReadonly();
  
  // Getter público para el query actual (para usar en pipes)
  get currentSearchQuery(): string {
    return this._searchQuery();
  }
  
  // Computed para verificar si hay menús cargados
  public hasMenus = computed(() => this._menuItems().length > 0);
  
  // Computed para menús filtrados que mantiene el árbol completo
  public filteredMenuItems = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    if (!query) {
      return this._menuItems();
    }
    
    return this.filterMenuItemsWithParents(this._menuItems(), query);
  });
  
  constructor() {
    console.log('🔧 MenuService iniciado');
    this.loadDefaultMenuItems();
  }
  
  /**
   * Carga los elementos del menú por defecto (hardcodeados por ahora)
   * En el futuro esto se reemplazará por una llamada al backend
   */
  private loadDefaultMenuItems(): void {
    const defaultMenuItems: MenuItem[] = [
      {
        id: '1',
        title: 'Configuraciones',
        description: 'Configuración del sistema',
        icon: 'Settings',
        level: 0,
        children: [
          {
            id: '2',
            route: '/planteles',
            title: 'Planteles',
            description: 'Gestión de planteles',
            icon: 'Building2',
            level: 1
          },
          {
            id: '3',
            route: '/usuarios',
            title: 'Usuarios',
            description: 'Administrar usuarios',
            icon: 'Users',
            level: 1
          },
          {
            id: '4',
            route: '/accesos',
            title: 'Accesos',
            description: 'Control de accesos',
            icon: 'Shield',
            level: 1
          }
        ]
      },
      {
        id: '10',
        title: 'Académico',
        description: 'Gestión académica',
        icon: 'FileText',
        level: 0,
        children: [
          {
            id: '11',
            title: 'Catálogos',
            description: 'Catálogos académicos',
            icon: 'Archive',
            level: 1,
            children: [
              {
                id: '12',
                route: '/academico/catalogosV2/carreras',
                title: 'Carreras',
                description: 'Gestión de carreras',
                icon: 'FileText',
                level: 2
              },
              {
                id: '13',
                route: '/academico/catalogos/grados',
                title: 'Grados (Nuevo ingreso)',
                description: 'Grados de nuevo ingreso',
                icon: 'FileText',
                level: 2
              },
              {
                id: '14',
                route: '/academico/materiasV2',
                title: 'Materias',
                description: 'Gestión de materias',
                icon: 'FileText',
                level: 2
              },
              {
                id: '15',
                route: '/academico/catalogos/fechas',
                title: 'Fechas',
                description: 'Calendario académico',
                icon: 'FileText',
                level: 2
              },
              {
                id: '16',
                route: '/academico/catalogos/fechas_periodos',
                title: 'Fechas Periodos',
                description: 'Periodos académicos',
                icon: 'FileText',
                level: 2
              }
            ]
          }
        ]
      },
      {
        id: '20',
        title: 'Recursos Humanos',
        description: 'Gestión de personal',
        icon: 'Users',
        level: 0,
        children: [
          {
            id: '21',
            route: '/recursoshumanos',
            title: 'Kardex',
            description: 'Expedientes de personal',
            icon: 'FileText',
            level: 1
          },
          {
            id: '22',
            route: '/recursoshumanosF/cambioadscripcion',
            title: 'Cambio de Adscripción',
            description: 'Cambios de adscripción',
            icon: 'Users',
            level: 1
          }
        ]
      },
      {
        id: '30',
        title: 'Informática',
        description: 'Servicios informáticos',
        icon: 'Settings',
        level: 0,
        badge: { text: 'IT', color: 'blue' },
        children: [
          {
            id: '31',
            route: '/informatica/catalogos/ordenesdeservicios',
            title: 'Ordenes de servicio',
            description: 'Gestión de órdenes',
            icon: 'FileText',
            level: 1
          },
          {
            id: '32',
            route: '/informatica/reportes',
            title: 'Reportes',
            description: 'Reportes del sistema',
            icon: 'BarChart3',
            level: 1
          },
          {
            id: '33',
            route: '/informatica/mail',
            title: 'Correos',
            description: 'Gestión de correos',
            icon: 'FileText',
            level: 1
          }
        ]
      },
      {
        id: '40',
        title: 'Administrativo',
        description: 'Gestión administrativa',
        icon: 'FileText',
        level: 0,
        children: [
          {
            id: '41',
            title: 'Viáticos',
            description: 'Gestión de viáticos',
            icon: 'FileText',
            level: 1,
            children: [
              {
                id: '42',
                route: '/administrativo/viaticos/index',
                title: 'Solicitud de Viáticos',
                description: 'Nueva solicitud',
                icon: 'FileText',
                level: 2
              },
              {
                id: '43',
                route: '/administrativo/viaticos/validar',
                title: 'Validación de Viáticos',
                description: 'Validar solicitudes',
                icon: 'Shield',
                level: 2,
                badge: { text: 'Pendientes', color: 'orange' }
              }
            ]
          }
        ]
      },
      {
        id: '50',
        title: 'Vinculación',
        description: 'Vinculación con el sector productivo',
        icon: 'Users',
        level: 0,
        children: [
          {
            id: '51',
            title: 'S. Social',
            description: 'Servicio social',
            icon: 'Users',
            level: 1,
            children: [
              {
                id: '52',
                route: '/vinculacion/s_social/captura',
                title: 'Captura',
                description: 'Captura de datos',
                icon: 'FileText',
                level: 2
              }
            ]
          }
        ]
      },
      {
        id: '60',
        title: 'Biblioteca',
        description: 'Gestión bibliotecaria',
        icon: 'Archive',
        level: 0,
        children: [
          {
            id: '61',
            route: '/biblioteca/principal/libros',
            title: 'Libros',
            description: 'Catálogo de libros',
            icon: 'FileText',
            level: 1
          },
          {
            id: '62',
            route: '/biblioteca/principal/movimientos',
            title: 'Movimientos',
            description: 'Préstamos y devoluciones',
            icon: 'FileText',
            level: 1
          }
        ]
      },
      {
        id: '70',
        title: 'Recepción',
        description: 'Gestión de correspondencia',
        icon: 'FileText',
        level: 0,
        children: [
          {
            id: '71',
            title: 'Correspondencia',
            description: 'Gestión de correspondencia',
            icon: 'FileText',
            level: 1,
            children: [
              {
                id: '72',
                route: '/recepcion/correspondencia/catalogos',
                title: 'Asignaciones',
                description: 'Asignar correspondencia',
                icon: 'FileText',
                level: 2
              },
              {
                id: '73',
                route: '/recepcion/correspondencia/reportes',
                title: 'Reportes',
                description: 'Reportes de correspondencia',
                icon: 'BarChart3',
                level: 2
              }
            ]
          }
        ]
      },
      {
        id: '80',
        title: 'Financieros',
        description: 'Gestión financiera',
        icon: 'BarChart3',
        level: 0,
        badge: { text: '$', color: 'green' },
        children: [
          {
            id: '81',
            route: '/financieros/pago_alumnos',
            title: 'Pago de alumnos',
            description: 'Gestión de pagos',
            icon: 'BarChart3',
            level: 1
          },
          {
            id: '82',
            route: '/financieros/fichas_admision',
            title: 'Ficha de admisión',
            description: 'Fichas de admisión',
            icon: 'FileText',
            level: 1
          }
        ]
      },
      {
        id: '90',
        title: 'Planeación',
        description: 'Planeación institucional',
        icon: 'BarChart3',
        level: 0,
        children: [
          {
            id: '91',
            route: '/planeacion/proyectos/reporte',
            title: 'Proyectos',
            description: 'Gestión de proyectos',
            icon: 'FileText',
            level: 1
          },
          {
            id: '92',
            route: '/planeacion/reportes',
            title: 'Estadísticas',
            description: 'Estadísticas institucionales',
            icon: 'BarChart3',
            level: 1
          }
        ]
      }
    ];
    
    this._menuItems.set(defaultMenuItems);
    console.log('📋 MenuItems cargados:', defaultMenuItems.length, 'elementos');
  }
  
  /**
   * Actualiza los elementos del menú
   * En el futuro esto será llamado después de obtener datos del backend
   */
  setMenuItems(items: MenuItem[]): void {
    this._menuItems.set(items);
    console.log('🔄 MenuItems actualizados:', items.length, 'elementos');
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
   * Busca un elemento por su ID
   */
  findItemById(id: string): MenuItem | null {
    const findInItems = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === id) {
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
   * Establece el query de búsqueda
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
    console.log('🔍 Búsqueda actualizada:', query);
    
    // Auto-expandir elementos que contienen coincidencias solo si hay query
    if (query.trim()) {
      this.expandItemsWithMatches(query);
    } else {
      // Si no hay query, cerrar todos los menús
      this.collapseAllItems();
    }
  }
  
  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this._searchQuery.set('');
    console.log('🧽 Búsqueda limpiada');
    
    // Cerrar todos los menús expandidos al limpiar la búsqueda
    this.collapseAllItems();
  }
  
  /**
   * Cierra todos los elementos expandidos
   */
  collapseAllItems(): void {
    this._expandedItems.set(new Set<string>());
    console.log('📁 Todos los menús cerrados');
  }
  
  /**
   * Filtra menús manteniendo el árbol completo de padres
   */
  private filterMenuItemsWithParents(items: MenuItem[], query: string): MenuItem[] {
    const filteredItems: MenuItem[] = [];
    
    for (const item of items) {
      // Verificar si este item coincide con la búsqueda
      const itemMatches = this.itemMatchesQuery(item, query);
      
      // Verificar si algún hijo coincide
      let filteredChildren: MenuItem[] = [];
      if (item.children && item.children.length > 0) {
        filteredChildren = this.filterMenuItemsWithParents(item.children, query);
      }
      
      // Si este item coincide O tiene hijos que coinciden, incluirlo
      if (itemMatches || filteredChildren.length > 0) {
        const filteredItem: MenuItem = {
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children
        };
        filteredItems.push(filteredItem);
      }
    }
    
    return filteredItems;
  }
  
  /**
   * Verifica si un item coincide con el query de búsqueda
   */
  private itemMatchesQuery(item: MenuItem, query: string): boolean {
    const normalizedQuery = query.toLowerCase();
    
    // Buscar en el título
    if (item.title && item.title.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Buscar en la descripción
    if (item.description && item.description.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Buscar en la ruta
    if (item.route && item.route.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Expande automáticamente los elementos que contienen coincidencias
   */
  private expandItemsWithMatches(query: string): void {
    const expandedSet = new Set(this._expandedItems());
    
    const checkAndExpand = (items: MenuItem[], parentPath: string[] = []): void => {
      for (const item of items) {
        const currentPath = [...parentPath, item.id];
        
        // Si este item coincide, expandir todos sus padres
        if (this.itemMatchesQuery(item, query)) {
          parentPath.forEach(parentId => expandedSet.add(parentId));
        }
        
        // Si tiene hijos, buscar recursivamente
        if (item.children && item.children.length > 0) {
          // Expandir este item para mostrar sus hijos
          expandedSet.add(item.id);
          checkAndExpand(item.children, currentPath);
        }
      }
    };
    
    checkAndExpand(this._menuItems());
    this._expandedItems.set(expandedSet);
  }
  
  /**
   * Método para cargar menús desde el backend (placeholder)
   */
  async loadMenusFromBackend(): Promise<void> {
    try {
      console.log('🌐 Cargando menús desde el backend...');
      
      // TODO: Implementar llamada real al backend
      // const response = await this.http.get<MenuItem[]>('/api/menus').toPromise();
      // this.setMenuItems(response);
      
      // Por ahora usamos los datos hardcodeados
      console.log('⚠️ Usando datos hardcodeados por ahora');
      
    } catch (error) {
      console.error('❌ Error cargando menús desde el backend:', error);
      // Fallback a menús por defecto
      this.loadDefaultMenuItems();
    }
  }
}

