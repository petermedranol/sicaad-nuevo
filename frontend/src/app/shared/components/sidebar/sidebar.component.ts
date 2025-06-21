import { Component, inject, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  lucidePanelRightClose,
  lucideSun,
  lucideMoon
} from '@ng-icons/lucide';
import { SidebarService } from '../../services/sidebar.service';
import { ThemeService } from '../../services/theme.service';
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
      lucidePanelRightClose,
      lucideSun,
      lucideMoon
    })
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);

  @Input() sidebarService = inject(SidebarService);
  @Input() themeService = inject(ThemeService);

  public menuService = inject(MenuService);

  @Output() closeSidebar = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery: string = '';

  ngOnInit() {
    this.searchQuery = this.menuService.currentSearchQuery;
    this.updateSearchInput();
  }

  private updateSearchInput(): void {
    setTimeout(() => {
      if (this.searchInput?.nativeElement) {
        this.searchInput.nativeElement.value = this.searchQuery;
      }
    }, 100);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.navigate.emit(route);
    this.menuService.updateActiveItemByRoute(route);
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
      setTimeout(() => this.searchInput.nativeElement.focus(), 300);
    } else {
      this.searchInput.nativeElement.focus();
    }
  }
}
