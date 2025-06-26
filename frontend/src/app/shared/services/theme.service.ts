import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { UserSettingsService } from './user-settings.service';
import { AuthService } from '../../auth/services/auth.service';

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
    console.log('🔄 Efecto de tema ejecutándose, nuevo tema:', theme);
    
    // Aplicar clases y atributos
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    const user = this.authService.currentUser();
    if (user?.id) {
      console.log('💾 Guardando tema en localStorage:', theme);
      // Guardar el tema y todas las configuraciones existentes
      const currentSettings = this.userSettings.getAll();
      this.userSettings.saveAll({
        ...currentSettings,
        theme: theme
      });
      
      // Verificar inmediatamente que se guardó correctamente
      const savedSettings = this.userSettings.getAll();
      console.log('✅ Configuraciones actualizadas:', savedSettings);
    }
  });

  constructor() {
    this.initializeTheme();

    // Escuchar eventos de sincronización de preferencias
    this.userSettings.preferencesSync.subscribe(() => {
      console.log('🔄 Preferencias sincronizadas, actualizando tema...');
      const allSettings = this.userSettings.getAll();
      if (allSettings?.theme && (allSettings.theme === 'light' || allSettings.theme === 'dark')) {
        console.log('🎨 Aplicando tema desde preferencias sincronizadas:', allSettings.theme);
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
      console.log('🔍 Usuario actual:', user?.id);
      
      // Obtener todas las configuraciones
      const allSettings = this.userSettings.getAll();
      console.log('📦 Todas las configuraciones:', allSettings);
      
      // Si hay un tema guardado en las configuraciones, usarlo
      if (allSettings && allSettings.theme && (allSettings.theme === 'light' || allSettings.theme === 'dark')) {
        console.log('🎨 Usando tema guardado:', allSettings.theme);
        this.currentTheme.set(allSettings.theme);
        return;
      }
      
      // Si no hay tema guardado o el usuario no está autenticado,
      // usar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      console.log('⚙️ Usando tema por defecto del sistema:', defaultTheme);
      this.currentTheme.set(defaultTheme);
      
      // Si hay usuario, guardar el tema por defecto
      if (user?.id) {
        console.log('💾 Guardando tema por defecto:', defaultTheme);
        this.userSettings.set('theme', defaultTheme);
      }
      
    } catch (e) {
      console.error('❌ Error al inicializar el tema:', e);
      this.currentTheme.set('light'); // Fallback seguro
    }
  }

  /**
   * Cambia el tema actual entre 'light' y 'dark'.
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    console.log('🔄 Cambiando tema a:', newTheme);
    this.currentTheme.set(newTheme);
  }
}
