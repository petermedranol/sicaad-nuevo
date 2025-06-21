import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
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

    // En escritorio, restaurar desde localStorage o usar valores por defecto.
    const savedOpen = localStorage.getItem('sidebarOpen');
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');

    // Por defecto, el sidebar está abierto en escritorio.
    this.isSidebarOpen.set(savedOpen !== null ? JSON.parse(savedOpen) : true);
    this.isSidebarCollapsed.set(savedCollapsed !== null ? JSON.parse(savedCollapsed) : false);
  }

  toggleSidebar() {
    const newValue = !this.isSidebarOpen();
    this.isSidebarOpen.set(newValue);

    // En móvil no guardar en localStorage
    if (!this.isMobile()) {
      localStorage.setItem('sidebarOpen', JSON.stringify(newValue));
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
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
    if (!this.isMobile()) {
      localStorage.setItem('sidebarOpen', JSON.stringify(false));
    }
  }

  openSidebar() {
    this.isSidebarOpen.set(true);
    if (!this.isMobile()) {
      localStorage.setItem('sidebarOpen', JSON.stringify(true));
    }
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  }
}
