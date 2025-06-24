import { Injectable, signal, effect, computed } from '@angular/core';

/**
 * Servicio para gestionar los temas de la aplicación (claro/oscuro).
 * Utiliza señales de Angular para la reactividad.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
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
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
  });

  constructor() {
    this.initializeTheme();
  }

  /**
   * Inicializa el tema al cargar el servicio.
   * Prioridad:
   * 1. Valor guardado en `localStorage`.
   * 2. Preferencia del sistema operativo del usuario (`prefers-color-scheme`).
   */
  private initializeTheme(): void {
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        this.currentTheme.set(storedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme.set(prefersDark ? 'dark' : 'light');
      }
    } catch (e) {
      console.error('Error al inicializar el tema:', e);
      this.currentTheme.set('light'); // Fallback seguro
    }
  }

  /**
   * Cambia el tema actual entre 'light' y 'dark'.
   */
  toggleTheme(): void {
    this.currentTheme.update(current => (current === 'light' ? 'dark' : 'light'));
  }
}
