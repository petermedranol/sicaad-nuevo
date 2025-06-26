import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TopbarService } from '../../../shared/services/topbar.service';
import { SidebarService } from '../../services/sidebar.service';
import { MenuService } from '../../services/menu.service';
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
  private menuService = inject(MenuService);
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

    try {
      await this.menuService.ensureMenusLoaded();
    } catch (error) {
      console.warn('⚠️ Error verificando menús:', error);
    }
  }

  onNavigate(route: string) {
    this.router.navigate([route]);
    if (this.isMobile()) {
      this.closeSidebar();
    }
  }

  logout() {
    this.authService.logout();
  }

  showNotifications() {
    console.log('Mostrar notificaciones');
  }

  showProfile() {
    console.log('Mostrar perfil de usuario');
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  }
}
