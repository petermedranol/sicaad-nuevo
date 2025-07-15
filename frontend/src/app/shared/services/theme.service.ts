import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { UserSettingsService } from './user-settings.service';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestionar los temas de la aplicación (claro/oscuro).
 * Utiliza señales de Angular para la reactividad.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private userSettings = inject(UserSettingsService);
  private authService = inject(AuthService);
  /**
   * Señal que almacena el tema actual ('light' o 'dark').
   * Se inicializa con 'light' como valor por defecto.
   */
  currentTheme = signal<'light' | 'dark'>('light');

  /**
   * Señal computada que devuelve `true` si el tema actual es 'dark'.
   * Se deriva de `currentTheme`.
   */
  isDarkMode = computed(() => this.currentTheme() === 'dark');

  /**
   * Efecto que se ejecuta automáticamente cuando `currentTheme` cambia.
   * - Aplica el `data-theme` al elemento <html>.
   * - Guarda la preferencia en `localStorage`.
   */
  private themeEffect = effect(() => {
    const theme = this.currentTheme();

    // Aplicar clases y atributos
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);

    const user = this.authService.currentUser();
    if (user?.id) {
      // Guardar el tema y todas las configuraciones existentes
      const currentSettings = this.userSettings.getAll();
      this.userSettings.saveAll({
        ...currentSettings,
        theme: theme
      });

      // Solo log en desarrollo con datos seguros
      this.logSafeData({ theme });
    }
  });

  constructor() {
    this.initializeTheme();

    // Escuchar eventos de sincronización de preferencias
    this.userSettings.preferencesSync.subscribe(() => {
      const allSettings = this.userSettings.getAll();
      if (allSettings?.theme && (allSettings.theme === 'light' || allSettings.theme === 'dark')) {
        this.currentTheme.set(allSettings.theme);
      }
    });
  }

  /**
   * Inicializa el tema al cargar el servicio.
   * Prioridad:
   * 1. Valor guardado en `localStorage`.
   * 2. Preferencia del sistema operativo del usuario (`prefers-color-scheme`).
   */
  private initializeTheme(): void {
    try {
      const user = this.authService.currentUser();

      // Obtener todas las configuraciones
      const allSettings = this.userSettings.getAll();

      // Si hay un tema guardado en las configuraciones, usarlo
      if (allSettings && allSettings.theme && (allSettings.theme === 'light' || allSettings.theme === 'dark')) {
        this.currentTheme.set(allSettings.theme);
        return;
      }

      // Si no hay tema guardado o el usuario no está autenticado,
      // usar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      this.currentTheme.set(defaultTheme);

      // Si hay usuario, guardar el tema por defecto
      if (user?.id) {
        this.userSettings.set('theme', defaultTheme);
      }

    } catch (e) {
      this.currentTheme.set('light'); // Fallback seguro
    }
  }

  /**
   * Log de datos seguros solo en desarrollo
   */
  private logSafeData(data: { theme: string }) {
    if (!environment.production) {
      const safeData = {
        theme: data.theme,
        timestamp: new Date().toISOString()
      };
      console.log('🎨 Configuraciones de tema guardadas:', safeData);
    }
  }

  /**
   * Cambia el tema actual entre 'light' y 'dark'.
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }
}
