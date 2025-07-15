import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TopbarService } from '../../../shared/services/topbar.service';
import { SidebarService } from '../../services/sidebar.service';
import { MenuService } from '../../services/menu.service';
import { UserSettingsService } from '../../services/user-settings.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { User } from '../../../auth/interfaces/user.interface';
import { LoadingService } from '../../services/loading.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgIconComponent,
    TopbarComponent,
    SidebarComponent
  ],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight
    })
  ],
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent implements OnInit {
  router = inject(Router);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  sidebarService = inject(SidebarService);
  menuService = inject(MenuService);
  private userSettings = inject(UserSettingsService);
  private loadingService = inject(LoadingService);
  private topbarService = inject(TopbarService);

  notificationCount = 3;

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  closeSidebar() {
    this.sidebarService.closeSidebar();
  }

  toggleSidebarCollapse() {
    this.sidebarService.toggleSidebarCollapse();
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  async ngOnInit() {
    this.sidebarService.init();
    await this.menuService.ensureMenusLoaded();

    // Asegurarse de que el estado inicial del menú se establezca correctamente
    const currentRoute = this.router.url === '/' ? '' : this.router.url;
    this.menuService.updateActiveItemByRoute(currentRoute);

  }

  onNavigate(route: string) {
    // Solo navegar si la ruta es diferente a la actual
    if (this.router.url !== route) {
      this.router.navigate([route]);
      if (this.isMobile()) {
        this.closeSidebar();
      }
    } else {
    }
  }

  logout() {
    this.authService.logout();
  }

  showNotifications() {
  }

  showProfile() {
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  }
}
