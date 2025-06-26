import { Injectable, signal, inject } from '@angular/core';
import { UserSettingsService } from './user-settings.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private userSettings = inject(UserSettingsService);
  private authService = inject(AuthService);
  isSidebarOpen = signal(false);
  isSidebarCollapsed = signal(false);

  constructor() {
    // El constructor se deja vacío. La inicialización se hará en init().
  }

  init() {
    // En móvil, el sidebar siempre empieza cerrado.
    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
      this.isSidebarCollapsed.set(false);
      return;
    }

    // En escritorio, restaurar desde UserSettings o usar valores por defecto.
    const user = this.authService.currentUser();
    if (user?.id) {
      const savedOpen = this.userSettings.get<string>('sidebarOpen', 'true');
      const savedCollapsed = this.userSettings.get<string>('sidebarCollapsed', 'false');
      
      this.isSidebarOpen.set(savedOpen === 'true');
      this.isSidebarCollapsed.set(savedCollapsed === 'true');
    } else {
      // Por defecto, el sidebar está abierto en escritorio.
      this.isSidebarOpen.set(true);
      this.isSidebarCollapsed.set(false);
    }
  }

  toggleSidebar() {
    const newValue = !this.isSidebarOpen();
    this.isSidebarOpen.set(newValue);

    // En móvil no guardar en settings
    if (!this.isMobile()) {
      const user = this.authService.currentUser();
      if (user?.id) {
        this.userSettings.set('sidebarOpen', String(newValue));
      }
    }
  }

  toggleSidebarCollapse() {
    // En móvil no permitir colapsar, solo abrir/cerrar
    if (this.isMobile()) {
      this.toggleSidebar();
      return;
    }

    const newValue = !this.isSidebarCollapsed();
    this.isSidebarCollapsed.set(newValue);
    
    const user = this.authService.currentUser();
    if (user?.id) {
      this.userSettings.set('sidebarCollapsed', String(newValue));
    }
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
    if (!this.isMobile()) {
      const user = this.authService.currentUser();
      if (user?.id) {
        this.userSettings.set('sidebarOpen', 'false');
      }
    }
  }

  openSidebar() {
    this.isSidebarOpen.set(true);
    if (!this.isMobile()) {
      const user = this.authService.currentUser();
      if (user?.id) {
        this.userSettings.set('sidebarOpen', 'true');
      }
    }
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  }
}
