import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent, User } from '../../components/topbar/topbar.component';
import { LoadingInterceptor } from '../../interceptors/loading.interceptor';
import { LoadingService } from '../../services/loading.service';
import { LucideAngularModule, PanelLeftClose, PanelLeft } from 'lucide-angular';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    RouterOutlet, 
    SidebarComponent, 
    TopbarComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent implements OnInit {
  router = inject(Router);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  sidebarService = inject(SidebarService);
  private loadingService = inject(LoadingService);
  private loadingInterceptor = inject(LoadingInterceptor); // Inicializar interceptor

  // Iconos disponibles
  readonly panelLeftCloseIcon = PanelLeftClose;
  readonly panelLeftIcon = PanelLeft;


  // Usuario para el topbar
  currentUser: User = {
    name: 'Pedro Medrano',
    email: 'pedro@cecytec.edu.mx',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Administrador'
  };

  // Contador de notificaciones
  notificationCount = 3;

  // Toggle del sidebar
  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  // Cerrar sidebar en móvil al hacer click en un enlace
  closeSidebar() {
    if (window.innerWidth < 1024) { // lg breakpoint
      this.sidebarService.isSidebarOpen.set(false);
    }
  }

  // Toggle del sidebar en desktop (colapsar/expandir)
  toggleSidebarCollapse() {
    this.sidebarService.toggleSidebarCollapse();
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
    // Mostrar loading de logout
    this.loadingService.showLogout();
    
    this.authService.logout()
      .then(() => {
        localStorage.removeItem('auth_token'); // opcional
        
        // Simular un pequeño delay para que se vea el loading
        setTimeout(() => {
          this.loadingService.hide();
          this.router.navigate(['/login']);
        }, 800);
      })
      .catch((err: any) => {
        console.error('Error al cerrar sesión:', err);
        this.loadingService.hide();
        this.router.navigate(['/login']);
      });
  }

  // Nuevos métodos para manejar eventos de los componentes
  onNavigate(route: string) {
    this.navigateTo(route);
  }

  showNotifications() {
    console.log('Mostrar notificaciones');
    // Aquí implementarías la lógica para mostrar notificaciones
  }

  showProfile() {
    console.log('Mostrar perfil de usuario');
    // Aquí implementarías la lógica para mostrar el perfil
  }
}
