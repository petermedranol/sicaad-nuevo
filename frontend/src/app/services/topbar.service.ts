import { Injectable, signal } from '@angular/core';

export interface TopbarButton {
  label: string;
  icon?: any; // Tipo any para aceptar iconos de Lucide
  onClick: () => void;
  class?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface TopbarConfig {
  title: string;
  description?: string;
  buttons?: TopbarButton[];
}

@Injectable({
  providedIn: 'root'
})
export class TopbarService {
  // Estado del topbar usando signals
  private topbarState = signal<TopbarConfig>({
    title: '',
    description: '',
    buttons: []
  });

  // Getters públicos
  get config() {
    return this.topbarState;
  }

  /**
   * Actualiza la configuración del topbar
   */
  updateTopbar(config: TopbarConfig) {
    this.topbarState.set({
      title: config.title,
      description: config.description || '',
      buttons: config.buttons || []
    });
  }

  /**
   * Limpia el estado del topbar
   */
  clearTopbar() {
    this.topbarState.set({
      title: '',
      description: '',
      buttons: []
    });
  }
}

