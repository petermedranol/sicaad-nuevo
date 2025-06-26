import { Component, inject, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Menu, Sun, Moon, Bell } from 'lucide-angular';
import { ThemeService } from '../../services/theme.service'; // CORREGIDO
import { TopbarService } from '../../../shared/services/topbar.service';
import { AuthService } from '../../../auth/services/auth.service';
// Asumimos que la interfaz de usuario está en auth/interfaces, si no, hay que crearla.
// import { User } from '../../../auth/interfaces/user.interface';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  // --- Servicios Inyectados ---
  public themeService = inject(ThemeService);
  public topbarService = inject(TopbarService);
  public authService = inject(AuthService);

  // --- Propiedades expuestas para la plantilla ---
  public topbarConfig = this.topbarService.config;

  // --- Salidas de Eventos ---
  @Output() toggleSidebar = new EventEmitter<void>();

  // --- Iconos ---
  readonly menuIcon = Menu;
  readonly bellIcon = Bell;

  // --- Señales Computadas para el Tema ---
  themeIcon = computed(() => (this.themeService.isDarkMode() ? Sun : Moon));
  themeTooltip = computed(() =>
    this.themeService.isDarkMode()
      ? 'Cambiar a modo claro'
      : 'Cambiar a modo oscuro'
  );

  // --- Lógica del Usuario ---
  currentUser = this.authService.currentUser;
  userInitials = computed(() => {
    // El tipo 'any' es temporal hasta que auth.service.ts esté correcto.
    const name = (this.currentUser() as any)?.name || '';
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  });

  // --- Propiedades para UI (Placeholders) ---
  hasNotifications = false;
  notificationCount = 0;

  // --- Métodos de Eventos ---
  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onShowNotifications(): void {
  }

  onShowProfile(): void {
  }

  onLogout(): void {
    this.authService.logout();
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.style.display = 'none';
  }
}