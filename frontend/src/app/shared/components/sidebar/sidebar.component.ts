import { Component, inject, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy, computed, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CecytecLogoComponent } from '../cecytec-logo/cecytec-logo.component';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';
import { MenuItem } from '../sidebar-menu/sidebar-menu.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideX,
  lucideLogOut,
  lucideFiles,
  lucideTrendingUp,
  lucideCircleCheck,
  lucidePanelLeft,
  lucidePanelRightClose
} from '@ng-icons/lucide';
import { SidebarService } from '../../services/sidebar.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    CecytecLogoComponent,
    SidebarMenuComponent
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideX,
      lucideLogOut,
      lucideFiles,
      lucideTrendingUp,
      lucideCircleCheck,
      lucidePanelLeft,
      lucidePanelRightClose
    })
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    // Limpiar timeout de hover
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    // Limpiar todos los timeouts pendientes
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts = [];

    // Limpiar suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

private hoverTimeout?: number;  private timeouts: number[] = [];

  @Input() sidebarService = inject(SidebarService);

  public menuService = inject(MenuService);

  @Output() closeSidebar = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery: string = '';
  private isAnimating = false;
  private previousCollapsed: boolean | undefined;

  constructor() {
    // Usar effect para detectar cambios en el estado de collapse
    effect(() => {
      const currentCollapsed = this.sidebarService.isSidebarCollapsed();
      // Solo ejecutar animación si no es la primera vez
      if (this.previousCollapsed !== undefined && this.previousCollapsed !== currentCollapsed) {
        this.handleCollapseAnimation(currentCollapsed);
      }
      this.previousCollapsed = currentCollapsed;
    });
  }

  ngOnInit() {
    this.searchQuery = this.menuService.currentSearchQuery;
    this.updateSearchInput();

    // Suscribirse a eventos de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Normalizar la ruta después de redirecciones
        const normalizedRoute = event.urlAfterRedirects === '/' ? '' : event.urlAfterRedirects;
        // Actualizar el estado del menú basado en la ruta actual
        this.menuService.updateActiveItemByRoute(normalizedRoute);
      }
    });
  }

  private updateSearchInput(): void {
    this.addSafeTimeout(() => {
      if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.value = this.searchQuery;
      }
    }, 100);
  }

  private addSafeTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(callback, delay);
    this.timeouts.push(id);
    return id;
  }

  navigateTo(route: string): void {
    // Normalizar la ruta
    const normalizedRoute = route === '/' ? '' : route;

    // Si es la ruta actual, solo actualizar el estado del menú
    if (this.router.url === normalizedRoute) {
      this.menuService.updateActiveItemByRoute(normalizedRoute);
      return;
    }

    // Si no es la ruta actual, primero navegar y dejar que el
    // NavigationEnd actualice el estado del menú
    this.navigate.emit(route);
  }

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  get isCollapsed(): boolean {
    return this.sidebarService.isSidebarCollapsed();
  }

  // Simplemente retornar una clase vacía - la animación la maneja Tailwind en dashboard-layout
  sidebarAnimationState = computed(() => {
    return ''; // Sin clases adicionales, dejamos que Tailwind maneje todo
  });  private handleCollapseAnimation(isCollapsed: boolean): void {
    this.isAnimating = true;

    // Después de la duración de la animación del sidebar
    this.addSafeTimeout(() => {
      this.isAnimating = false;
    }, 400); // Duración de la animación del sidebar
  }

  onMenuItemClick(menuItem: MenuItem): void {
    if (menuItem.route && menuItem.route.trim() !== '' && (!menuItem.children || menuItem.children.length === 0)) {
      this.menuService.setActiveItem(menuItem.id);
      this.navigateTo(menuItem.route);
    }
  }

  onMenuToggleExpanded(itemId: string): void {
    this.menuService.toggleExpanded(itemId);
  }

  onMenuNavigate(route: string): void {
    if (route && route.trim() !== '') {
      this.navigateTo(route);
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.menuService.setSearchQuery(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    this.menuService.clearSearch();
  }

  focusSearch(): void {
    if (this.isCollapsed) {
    this.sidebarService.toggleSidebarCollapse();
    this.addSafeTimeout(() => this.searchInput.nativeElement.focus(), 300);
    } else {
      this.searchInput.nativeElement.focus();
    }
  }
}
