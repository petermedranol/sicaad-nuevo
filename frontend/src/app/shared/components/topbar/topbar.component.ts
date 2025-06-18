import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { 
  Menu,
  Sun,
  Moon,
  Bell,
  ChevronDown
} from 'lucide-angular';
import { ThemeService } from '../../services/theme.service';

export interface User {
  name: string;
  email: string;
  avatar: string;
  role?: string;
}

@Component({
  selector: 'app-topbar',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  @Input() themeService = inject(ThemeService);
  @Input() title: string = 'Dashboard';
  @Input() subtitle: string = '';
  @Input() currentUser: User = {
    name: 'Usuario',
    email: 'usuario@cecytec.edu.mx',
    avatar: '/assets/images/default-avatar.png'
  };
  @Input() notificationCount: number = 0;
  
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();
  @Output() showNotifications = new EventEmitter<void>();
  @Output() showProfile = new EventEmitter<void>();

  // Iconos
  readonly menuIcon = Menu;
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly bellIcon = Bell;
  readonly chevronDownIcon = ChevronDown;

  /**
   * Emite evento para toggle del sidebar
   */
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  /**
   * Emite evento para cambio de tema
   */
  onToggleTheme(): void {
    this.toggleTheme.emit();
  }

  /**
   * Emite evento para mostrar notificaciones
   */
  onShowNotifications(): void {
    this.showNotifications.emit();
  }

  /**
   * Emite evento para mostrar perfil
   */
  onShowProfile(): void {
    this.showProfile.emit();
  }

  /**
   * Obtiene el icono del tema actual
   */
  get themeIcon() {
    return this.themeService.isDarkMode() ? this.sunIcon : this.moonIcon;
  }

  /**
   * Obtiene el tooltip para el botón de tema
   */
  get themeTooltip(): string {
    return this.themeService.isDarkMode() 
      ? 'Cambiar a modo claro' 
      : 'Cambiar a modo oscuro';
  }

  /**
   * Verifica si hay notificaciones
   */
  get hasNotifications(): boolean {
    return this.notificationCount > 0;
  }

  /**
   * Obtiene el avatar del usuario o un avatar por defecto
   */
  get userAvatar(): string {
    return this.currentUser.avatar || '/assets/images/default-avatar.png';
  }

  /**
   * Obtiene las iniciales del usuario
   */
  get userInitials(): string {
    if (!this.currentUser.name) return 'U';
    
    return this.currentUser.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  /**
   * Maneja el error al cargar la imagen del avatar
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
