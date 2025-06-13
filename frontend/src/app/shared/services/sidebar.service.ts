import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  isSidebarOpen = signal(false);
  isSidebarCollapsed = signal(false);

  constructor() {
    // Inicializar desde localStorage
    const savedOpen = localStorage.getItem('sidebarOpen');
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedOpen !== null) this.isSidebarOpen.set(JSON.parse(savedOpen));
    if (savedCollapsed !== null) this.isSidebarCollapsed.set(JSON.parse(savedCollapsed));
  }

  toggleSidebar() {
    const newValue = !this.isSidebarOpen();
    this.isSidebarOpen.set(newValue);
    localStorage.setItem('sidebarOpen', JSON.stringify(newValue));
    // Aquí podrías hacer una petición al backend en el futuro
  }

  toggleSidebarCollapse() {
    const newValue = !this.isSidebarCollapsed();
    this.isSidebarCollapsed.set(newValue);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
    // Aquí podrías hacer una petición al backend en el futuro
  }
}
