import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LogoComponent } from '../../components/logo/logo.component';
import { LucideAngularModule, Menu, X, Home, Users, Settings, BarChart3, FileText, Bell, LogOut, User, Search, Sun, Moon, PanelLeftClose, PanelLeft, Clock } from 'lucide-angular';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterOutlet, LogoComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent implements OnInit {
  router = inject(Router);
  private authService = inject(AuthService);
  themeService = inject(ThemeService); // Público para template
  
  // Signals para estado del sidebar
  isSidebarOpen = signal(false);
  isSidebarCollapsed = signal(false);
  
  // Iconos disponibles
  readonly menuIcon = Menu;
  readonly xIcon = X;
  readonly homeIcon = Home;
  readonly usersIcon = Users;
  readonly settingsIcon = Settings;
  readonly chartIcon = BarChart3;
  readonly fileIcon = FileText;
  readonly bellIcon = Bell;
  readonly logoutIcon = LogOut;
  readonly userIcon = User;
  readonly searchIcon = Search;
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly panelLeftCloseIcon = PanelLeftClose;
  readonly panelLeftIcon = PanelLeft;
  readonly clockIcon = Clock;
  
  // Elementos del menú
  menuItems = [
    {
      title: 'Dashboard',
      icon: this.homeIcon,
      route: '/dashboard',
      description: 'Vista general del sistema'
    },
    {
      title: 'Usuarios',
      icon: this.usersIcon,
      route: '/dashboard/users',
      description: 'Gestión de usuarios'
    },
    {
      title: 'Reportes',
      icon: this.chartIcon,
      route: '/dashboard/reports',
      description: 'Análisis y estadísticas'
    },
    {
      title: 'Documentos',
      icon: this.fileIcon,
      route: '/dashboard/documents',
      description: 'Gestión documental'
    },
    {
      title: 'Configuración',
      icon: this.settingsIcon,
      route: '/dashboard/settings',
      description: 'Configuración del sistema'
    }
  ];
  
  // Usuario mock (después vendrá desde el servicio)
  currentUser = {
    name: 'Pedro Medrano',
    email: 'pedro@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };

  // Toggle del sidebar
  toggleSidebar() {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }
  
  // Cerrar sidebar en móvil al hacer click en un enlace
  closeSidebar() {
    if (window.innerWidth < 1024) { // lg breakpoint
      this.isSidebarOpen.set(false);
    }
  }
  
  // Toggle del sidebar en desktop (colapsar/expandir)
  toggleSidebarCollapse() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }
  
  // Toggle del modo oscuro - SIMPLIFICADO con servicio
  toggleDarkMode() {
    this.themeService.toggleTheme();
  }
  
  // Inicialización simple
  ngOnInit() {
    console.log('✅ Dashboard inicializado');
  }
  
  // Navegar a una ruta
  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeSidebar();
  }

  logout() {
    this.authService.logout()
      .then(() => {
        localStorage.removeItem('auth_token'); // opcional
        this.router.navigate(['/login']);
      })
      .catch((err: any) => {
        console.error('Error al cerrar sesión:', err);
        this.router.navigate(['/login']);
      });
  }
}
