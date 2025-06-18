import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { MenuService } from '../../services/menu.service';

// Re-exportar la interfaz para que otros componentes puedan usarla
export type { MenuItem } from '../../interfaces/menu-item.interface';
import { 
  ChevronDown, 
  ChevronRight,
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Building2,
  UserCheck,
  Shield,
  Database,
  Archive
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HighlightPipe, forwardRef(() => SidebarMenuComponent)],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.css'
})
export class SidebarMenuComponent implements OnInit, OnDestroy {
  @Input() menuItems: MenuItem[] = [];
  @Input() isCollapsed: boolean = false;
  @Input() level: number = 0;
  @Input() expandedItems: Set<string> = new Set();
  @Input() activeItem: string | null = null;
  @Input() isFloatingMenu: boolean = false; // Para manejar comportamiento en menús flotantes
  
  @Output() itemClick = new EventEmitter<MenuItem>();
  @Output() toggleExpanded = new EventEmitter<string>();
  @Output() navigate = new EventEmitter<string>();
  
  // Inyectar MenuService para acceder al searchQuery
  private menuService = inject(MenuService);

  // Estado del menú flotante
  private currentFloatingMenuId: string | null = null;
  private floatingMenuTimeout: any = null;
  private clickOutsideHandler: ((event: Event) => void) | null = null;
  

  // Iconos
  chevronDown = ChevronDown;
  chevronRight = ChevronRight;
  homeIcon = Home;
  usersIcon = Users;
  fileTextIcon = FileText;
  barChart3Icon = BarChart3;
  settingsIcon = Settings;
  building2Icon = Building2;
  userCheckIcon = UserCheck;
  shieldIcon = Shield;
  databaseIcon = Database;
  archiveIcon = Archive;

  ngOnInit() {
    // Establecer el nivel para cada item
    this.menuItems.forEach(item => {
      if (item.level === undefined) {
        item.level = this.level;
      }
    });
  }
  
  ngOnDestroy() {
    // Limpiar event listeners al destruir el componente
    this.removeClickOutsideHandler();
    if (this.floatingMenuTimeout) {
      clearTimeout(this.floatingMenuTimeout);
    }
  }

  onItemClick(item: MenuItem, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.hasChildren(item)) {
      // Es un item con submenús - solo expandir/contraer, NO navegar
      this.toggleExpanded.emit(item.id);
    } else if (item.route && item.route.trim() !== '') {
      // Es un item de navegación (hoja del árbol) con ruta válida
      this.itemClick.emit(item);
      this.navigate.emit(item.route);
    } else {
      // Item sin ruta válida ni hijos - solo expandir/contraer
      this.toggleExpanded.emit(item.id);
    }
  }

  isItemExpanded(itemId: string): boolean {
    // Usar el signal del MenuService directamente para reactivity
    const expandedItemsFromService = this.menuService.expandedItems();
    return expandedItemsFromService.has(itemId);
  }

  isItemActive(item: MenuItem): boolean {
    return this.activeItem === item.id;
  }

  hasChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  getItemClasses(item: MenuItem): string {
    const baseClasses = 'sidebar-menu-link sidebar-tooltip';
    const activeClass = this.isItemActive(item) ? 'active' : '';
    const parentClass = this.hasChildren(item) ? 'has-children' : '';
    
    return [baseClasses, activeClass, parentClass]
      .filter(Boolean)
      .join(' ');
  }

  getIconByName(iconName: string) {
    const iconMap: { [key: string]: any } = {
      'Home': this.homeIcon,
      'Users': this.usersIcon,
      'FileText': this.fileTextIcon,
      'BarChart3': this.barChart3Icon,
      'Settings': this.settingsIcon,
      'Building2': this.building2Icon,
      'UserCheck': this.userCheckIcon,
      'Shield': this.shieldIcon,
      'Database': this.databaseIcon,
      'Archive': this.archiveIcon
    };
    
    return iconMap[iconName] || this.homeIcon;
  }
  
  // Getter para acceder al searchQuery del MenuService
  get searchQuery(): string {
    return this.menuService.currentSearchQuery;
  }
  
  // Métodos para el menú flotante
  isFloatingMenuVisible(itemId: string): boolean {
    return this.currentFloatingMenuId === itemId;
  }
  
  toggleFloatingMenu(itemId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Ocultar tooltip al hacer click
    this.hideTooltip(event);
    
    if (this.currentFloatingMenuId === itemId) {
      // Si ya está abierto, cerrarlo
      this.hideFloatingMenu();
    } else {
      // Si no está abierto o está otro abierto, mostrar este
      this.showFloatingMenu(itemId);
    }
  }
  
  showFloatingMenu(itemId: string): void {
    // Limpiar timeout anterior si existe
    if (this.floatingMenuTimeout) {
      clearTimeout(this.floatingMenuTimeout);
    }
    
    // Cerrar cualquier menú flotante anterior
    this.removeClickOutsideHandler();
    
    this.currentFloatingMenuId = itemId;
    
    // Calcular posición dinámicamente
    setTimeout(() => {
      this.updateFloatingMenuPosition(itemId);
      this.addClickOutsideHandler();
    }, 0);
  }
  
  hideFloatingMenu(): void {
    this.currentFloatingMenuId = null;
    this.removeClickOutsideHandler();
  }
  
  private addClickOutsideHandler(): void {
    if (this.clickOutsideHandler) {
      return; // Ya existe el handler
    }
    
    this.clickOutsideHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      const floatingMenu = document.querySelector('.floating-submenu--visible');
      const triggerElement = document.querySelector(`[data-menu-item-id="${this.currentFloatingMenuId}"]`);
      
      // Si el click no fue dentro del menú flotante ni en el trigger, cerrar el menú
      if (floatingMenu && !floatingMenu.contains(target) && 
          triggerElement && !triggerElement.contains(target)) {
        this.hideFloatingMenu();
      }
    };
    
    // Usar setTimeout para evitar que el click inicial cierre inmediatamente el menú
    setTimeout(() => {
      document.addEventListener('click', this.clickOutsideHandler!);
    }, 100);
  }
  
  private removeClickOutsideHandler(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }
  
  private updateFloatingMenuPosition(itemId: string): void {
    const floatingMenu = document.querySelector('.floating-submenu--visible');
    const triggerElement = document.querySelector(`[data-menu-item-id="${itemId}"]`);
    
    if (floatingMenu && triggerElement) {
      const triggerRect = triggerElement.getBoundingClientRect();
      const sidebarWidth = 5 * 16; // 5rem en pixels (16px por rem)
      
      // Posicionar el menú flotante pegado a la sidebar (sin margen extra)
      (floatingMenu as HTMLElement).style.left = `${sidebarWidth}px`; // Pegado directamente a la sidebar
      (floatingMenu as HTMLElement).style.top = `${triggerRect.top}px`;
    }
  }
  
  // Métodos para manejar el menú flotante con hover
  onMouseEnter(item: MenuItem, event: MouseEvent): void {
    // Limpiar cualquier timeout pendiente
    if (this.floatingMenuTimeout) {
      clearTimeout(this.floatingMenuTimeout);
      this.floatingMenuTimeout = null;
    }
    
    // Manejar menú flotante si es necesario
    if (this.isCollapsed && this.hasChildren(item) && !this.isFloatingMenu) {
      this.showFloatingMenu(item.id);
    }
  }
  
  onMouseLeave(item: MenuItem, event: MouseEvent): void {
    // Programar el cierre del menú flotante con un delay
    if (this.isCollapsed && this.hasChildren(item) && !this.isFloatingMenu) {
      this.floatingMenuTimeout = setTimeout(() => {
        this.hideFloatingMenu();
      }, 300); // 300ms de delay para permitir moverse al menú flotante
    }
  }
  
  // Métodos para manejar hover en el menú flotante mismo
  onFloatingMenuMouseEnter(): void {
    // Cancelar el cierre programado si el usuario está sobre el menú flotante
    if (this.floatingMenuTimeout) {
      clearTimeout(this.floatingMenuTimeout);
      this.floatingMenuTimeout = null;
    }
  }
  
  onFloatingMenuMouseLeave(): void {
    // Cerrar el menú flotante cuando el usuario sale de él
    this.hideFloatingMenu();
  }
  
  // Método para ocultar tooltip cuando se hace click
  private hideTooltip(event: Event): void {
    const triggerElement = event.currentTarget as HTMLElement;
    if (triggerElement) {
      // Remover atributo data-tooltip temporalmente para ocultar el tooltip
      const tooltip = triggerElement.getAttribute('data-tooltip');
      if (tooltip) {
        triggerElement.removeAttribute('data-tooltip');
        // Restaurar el tooltip después de un breve delay
        setTimeout(() => {
          triggerElement.setAttribute('data-tooltip', tooltip);
        }, 100);
      }
      // También limpiar la variable CSS custom
      triggerElement.style.removeProperty('--tooltip-top');
    }
  }
  
}
