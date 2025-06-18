import { Injectable, signal } from '@angular/core';

export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress: number; // 0-100
  showProgress: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal reactivo para el estado de loading
  private _loadingState = signal<LoadingState>({
    isLoading: false,
    message: '',
    progress: 0,
    showProgress: false
  });

  // Getter público para acceder al estado
  loadingState = this._loadingState.asReadonly();

  /**
   * Mostrar loading con mensaje opcional
   */
  show(message: string = 'Cargando...', showProgress: boolean = false): void {
    this._loadingState.set({
      isLoading: true,
      message,
      progress: 0,
      showProgress
    });
  }

  /**
   * Ocultar loading
   */
  hide(): void {
    this._loadingState.set({
      isLoading: false,
      message: '',
      progress: 0,
      showProgress: false
    });
  }

  /**
   * Actualizar mensaje de loading
   */
  updateMessage(message: string): void {
    const current = this._loadingState();
    if (current.isLoading) {
      this._loadingState.set({
        ...current,
        message
      });
    }
  }

  /**
   * Actualizar progreso (0-100)
   */
  updateProgress(progress: number): void {
    const current = this._loadingState();
    if (current.isLoading) {
      this._loadingState.set({
        ...current,
        progress: Math.max(0, Math.min(100, progress))
      });
    }
  }

  /**
   * Simular progreso automático para operaciones indeterminadas
   */
  startAutoProgress(duration: number = 3000): void {
    const current = this._loadingState();
    if (!current.isLoading) return;

    let progress = 0;
    const interval = 50; // Actualizar cada 50ms
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      progress += increment;
      
      if (progress >= 90) {
        // Frenar al 90% y esperar que se complete manualmente
        clearInterval(timer);
        this.updateProgress(90);
      } else {
        this.updateProgress(progress);
      }
    }, interval);
  }

  /**
   * Loading para validación de credenciales
   */
  showValidatingCredentials(): void {
    this.show('Validando credenciales...', false);
  }

  /**
   * Loading para login exitoso
   */
  showLoginSuccess(): void {
    this.updateMessage('Acceso concedido');
  }

  /**
   * Loading para carga del dashboard
   */
  showLoadingDashboard(): void {
    this.show('Cargando Dashboard...', false);
  }

  /**
   * Loading para navegación/lazy loading
   */
  showNavigation(route: string): void {
    this.show(`Cargando ${route}...`, false);
  }

  /**
   * Loading para logout
   */
  showLogout(): void {
    this.show('Cerrando sesión...', false);
  }

  /**
   * Loading para operaciones generales
   */
  showOperation(operation: string): void {
    this.show(`${operation}...`, false);
  }

  /**
   * Loading para guardado de datos
   */
  showSaving(item: string = 'datos'): void {
    this.show(`Guardando ${item}...`, false);
  }

  /**
   * Loading para carga de datos
   */
  showLoading(item: string = 'datos'): void {
    this.show(`Cargando ${item}...`, false);
  }

  /**
   * Loading para eliminación
   */
  showDeleting(item: string = 'elemento'): void {
    this.show(`Eliminando ${item}...`, false);
  }

  /**
   * Completar operación con progreso al 100%
   */
  complete(): void {
    const current = this._loadingState();
    if (current.isLoading && current.showProgress) {
      this.updateProgress(100);
      // Esperar un momento para mostrar el 100% antes de ocultar
      setTimeout(() => {
        this.hide();
      }, 300);
    } else {
      this.hide();
    }
  }
}

