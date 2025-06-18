import { Component, inject, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CecytecLogoComponent } from '../cecytec-logo/cecytec-logo.component';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';
import { MenuItem } from '../sidebar-menu/sidebar-menu.component';
import { 
  Search,
  X,
  LogOut
} from 'lucide-angular';
import { SidebarService } from '../../services/sidebar.service';
import { ThemeService } from '../../services/theme.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    LucideAngularModule,
    CecytecLogoComponent,
    SidebarMenuComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private router = inject(Router);
  
  @Input() sidebarService = inject(SidebarService);
  @Input() themeService = inject(ThemeService);
  
  // Inyectar MenuService
  public menuService = inject(MenuService);
  
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  // ViewChild para el input de búsqueda
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Iconos
  readonly searchIcon = Search;
  readonly xIcon = X;
  readonly logoutIcon = LogOut;

  // Propiedades de búsqueda
  searchQuery: string = '';

  navigateTo(route: string): void {
    console.log('🚀 Navegando a:', route);
    this.router.navigate([route]);
    this.navigate.emit(route);
    
    // Actualizar item activo en el MenuService
    this.menuService.updateActiveItemByRoute(route);
    
    // Cerrar sidebar en móvil
    if (window.innerWidth < 1024) {
      this.onCloseSidebar();
    }
  }

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  getSidebarClasses(): string {
    const classes = ['sidebar-container'];
    
    if (this.sidebarService.isSidebarCollapsed()) {
      classes.push('sidebar-collapsed');
    }
    
    if (this.sidebarService.isSidebarOpen()) {
      classes.push('mobile-open');
    }
    
    return classes.join(' ');
  }

  get isCollapsed(): boolean {
    return this.sidebarService.isSidebarCollapsed();
  }

  get isOpen(): boolean {
    return this.sidebarService.isSidebarOpen();
  }

  // Métodos para manejar el menú jerárquico
  onMenuItemClick(menuItem: MenuItem): void {
    console.log('🏠 SidebarComponent - onMenuItemClick:', menuItem.title, 'Ruta:', menuItem.route);
    
    // Solo navegar si el item tiene una ruta VÁLIDA y NO tiene hijos
    if (menuItem.route && menuItem.route.trim() !== '' && (!menuItem.children || menuItem.children.length === 0)) {
      console.log('🔗 Navegando desde sidebar a:', menuItem.route);
      this.menuService.setActiveItem(menuItem.id);
      this.navigateTo(menuItem.route);
    } else {
      console.log('🚫 No navegando - es elemento padre o sin ruta válida');
    }
  }

  onMenuToggleExpanded(itemId: string): void {
    console.log('🔄 Toggle expanded para item:', itemId);
    this.menuService.toggleExpanded(itemId);
  }

  onMenuNavigate(route: string): void {
    console.log('🗺️ SidebarComponent - onMenuNavigate llamado con ruta:', route);
    if (route && route.trim() !== '') {
      console.log('🔗 Navegando a ruta válida:', route);
      this.navigateTo(route);
    } else {
      console.log('🚫 Ruta inválida o vacía, no navegando:', route);
    }
  }

  // Métodos de búsqueda
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    console.log('🔍 Búsqueda:', this.searchQuery);
    
    // Actualizar la búsqueda en el MenuService
    this.menuService.setSearchQuery(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    console.log('🧽 Búsqueda limpiada');
    
    // Limpiar la búsqueda en el MenuService
    this.menuService.clearSearch();
  }

  focusSearch(): void {
    // Si está colapsado, expandir primero
    if (this.isCollapsed) {
      this.sidebarService.toggleSidebarCollapse();
      
      // Esperar a que se complete la animación antes de hacer focus
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      }, 300); // Duración de la animación CSS
    } else if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }
}
