import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal reactivo para el estado del tema
  isDarkMode = signal(false);
  
  // Colores CECYTEC
  private readonly CECYTEC_COLORS = {
    orange: '#F15A22',    // Logo/Encabezado
    greenMedium: '#39B54A', // Iconos
    greenLight: '#8CC63F',  // Botones claros
    greenDark: '#006838',   // Botones oscuros
    grayLight: '#F7F7F7',   // Fondo claro
    grayBorder: '#D9D9D9',  // Bordes
    textDark: '#333333',    // Texto oscuro
    textLight: '#B7B7B7'    // Texto secundario
  };
  
  constructor() {
    this.initializeTheme();
  }
  
  /**
   * Inicializar tema - Automático basado en hora de México
   */
  private initializeTheme(): void {
    console.log('🚀 Inicializando ThemeService automático');
    
    // Verificar si hay preferencia guardada
    const savedTheme = localStorage.getItem('darkMode');
    const savedAutoMode = localStorage.getItem('autoMode');
    
    if (savedAutoMode === 'true' || !savedTheme) {
      // Modo automático basado en hora de México
      const shouldBeDark = this.shouldUseDarkModeByTime();
      this.isDarkMode.set(shouldBeDark);
      this.applyTheme(shouldBeDark);
      localStorage.setItem('autoMode', 'true');
      console.log(`✅ Tema automático: ${shouldBeDark ? 'oscuro' : 'claro'} basado en hora de México`);
    } else {
      // Usar preferencia guardada
      const isDark = savedTheme === 'true';
      this.isDarkMode.set(isDark);
      this.applyTheme(isDark);
      console.log(`✅ Tema guardado aplicado: ${isDark ? 'oscuro' : 'claro'}`);
    }
    
    // Aplicar inmediatamente sin delay
    this.applyTheme(this.isDarkMode());
    
    // Aplicar después de que el DOM esté listo para asegurar consistencia
    setTimeout(() => {
      this.applyTheme(this.isDarkMode());
      this.fixCollapsedSidebar();
    }, 100);
    
    // Una aplicación final para casos edge
    setTimeout(() => {
      this.fixCollapsedSidebar();
    }, 500);
  }
  
  /**
   * Toggle entre modo claro y oscuro (desactiva modo automático)
   */
  toggleTheme(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    this.applyTheme(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    localStorage.setItem('autoMode', 'false'); // Desactivar modo automático
    
    // Arreglar sidebar colapsado después del cambio
    setTimeout(() => {
      this.fixCollapsedSidebar();
    }, 100);
  }
  
  /**
   * Aplicar tema específico - SOLO DaisyUI
   */
  private applyTheme(isDark: boolean): void {
    const html = document.documentElement;
    
    if (isDark) {
      html.setAttribute('data-theme', 'dracula');
    } else {
      html.setAttribute('data-theme', 'cupcake');
    }
    
    console.log(`🎨 Tema ${isDark ? 'dracula' : 'cupcake'} aplicado`);
  }
  
  
  /**
   * Determinar si debe usarse modo oscuro basado en la hora de México
   */
  private shouldUseDarkModeByTime(): boolean {
    const now = new Date();
    
    // Convertir a hora de México (UTC-6)
    const mexicoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
    const hour = mexicoTime.getHours();
    
    console.log(`🕐 Hora actual de México: ${mexicoTime.toLocaleTimeString('es-MX')} (${hour}:${mexicoTime.getMinutes().toString().padStart(2, '0')})`);
    
    // Modo oscuro desde las 19:00 (7 PM) hasta las 6:00 (6 AM)
    const isDarkTime = hour >= 19 || hour < 6;
    
    console.log(`${isDarkTime ? '🌙' : '☀️'} Debería usar tema ${isDarkTime ? 'oscuro' : 'claro'} según la hora`);
    
    return isDarkTime;
  }
  
  /**
   * Activar modo automático basado en hora
   */
  enableAutoMode(): void {
    localStorage.setItem('autoMode', 'true');
    const shouldBeDark = this.shouldUseDarkModeByTime();
    this.isDarkMode.set(shouldBeDark);
    this.applyTheme(shouldBeDark);
    
    setTimeout(() => {
      this.fixCollapsedSidebar();
    }, 100);
    
    console.log('🤖 Modo automático activado');
  }
  
  /**
   * Verificar si está en modo automático
   */
  isAutoMode(): boolean {
    return localStorage.getItem('autoMode') === 'true';
  }
  
  /**
   * Obtener información de hora actual de México
   */
  getMexicoTimeInfo() {
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
    
    return {
      time: mexicoTime,
      formatted: mexicoTime.toLocaleTimeString('es-MX', { hour12: false }),
      hour: mexicoTime.getHours(),
      shouldBeDark: this.shouldUseDarkModeByTime()
    };
  }
  
  /**
   * Arreglar sidebar simple - solo cambiar data-theme
   */
  fixCollapsedSidebar(): void {
    // No hacer nada complejo, solo asegurar que el data-theme esté correcto
    const html = document.documentElement;
    const currentTheme = this.isDarkMode() ? 'dracula' : 'cupcake';
    
    if (html.getAttribute('data-theme') !== currentTheme) {
      html.setAttribute('data-theme', currentTheme);
      console.log(`🔧 Tema ${currentTheme} reaplicado`);
    }
  }
  
  /**
   * Obtener el tema actual como string
   */
  currentTheme(): string {
    return this.isDarkMode() ? 'dracula' : 'cupcake';
  }
  
  /**
   * Obtener colores CECYTEC para uso en componentes
   */
  getCecytecColors() {
    return { ...this.CECYTEC_COLORS };
  }
}

