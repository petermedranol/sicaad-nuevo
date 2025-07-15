import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private readonly SETTINGS_KEY = 'sicaad_user_settings';
  private readonly API_URL = `${environment.apiUrl}/api/user/preferences`;

  // Evento que se emite cuando las preferencias se sincronizan
  public preferencesSync = new Subject<void>();

  constructor(private http: HttpClient) {}

  getAll(): any {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  }

  get<T>(setting: string, fallback: T): T {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : {};
    return (settings && settings[setting] !== undefined) ? settings[setting] as T : fallback;
  }

  set(setting: string, value: any): void {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : {};
    settings[setting] = value;
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  saveAll(newSettings: any): void {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : {};
    Object.assign(settings, newSettings);
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Sincroniza las preferencias con el servidor
   */
  async syncWithServer(): Promise<void> {
    try {
      // Guardar configuraciones locales importantes antes de sincronizar
      const currentSettings = this.getAll();
      const localSidebarOpen = currentSettings.sidebarOpen;
      const localSidebarCollapsed = currentSettings.sidebarCollapsed;
      const activeItem = currentSettings.activeItem;

      const response = await lastValueFrom(this.http.get<{preferences: any}>(this.API_URL, { withCredentials: true }));
      if (response?.preferences) {
        // Asegurarse de preservar valores manejados localmente
        const newSettings = {
          ...response.preferences,
          activeItem: response.preferences.activeItem || activeItem,
          // Preservar configuraciones del sidebar que se manejan localmente
          sidebarOpen: localSidebarOpen !== undefined ? localSidebarOpen : response.preferences.sidebarOpen,
          sidebarCollapsed: localSidebarCollapsed !== undefined ? localSidebarCollapsed : response.preferences.sidebarCollapsed
        };
        this.saveAll(newSettings);
        this.preferencesSync.next();
      }
    } catch (error) {
    }
  }

  /**
   * Guarda las preferencias en el servidor
   */
  async saveToServer(): Promise<void> {
    try {
      const settings = this.getAll();
      await lastValueFrom(this.http.post(this.API_URL, { preferences: settings }, { withCredentials: true }));
    } catch (error) {
    }
  }

  remove(): void {
    localStorage.removeItem(this.SETTINGS_KEY);
  }

  /**
   * Utilidad para migrar settings viejos (llámalo después de login)
   * map: { claveVieja: propiedadNueva }
   */
  migrateFromOldKeys(map: { [oldKey: string]: string }) {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    const settings = data ? JSON.parse(data) : {};
    let migrated = false;

    // Migrar configuraciones anteriores
    for (const oldKey in map) {
      const oldData = localStorage.getItem(oldKey);
      if (oldData !== null) {
        try {
          const value = JSON.parse(oldData);
          settings[map[oldKey]] = value;
          localStorage.removeItem(oldKey);
          migrated = true;
        } catch {
          // Si no es JSON válido, usar el valor tal cual
          settings[map[oldKey]] = oldData;
          localStorage.removeItem(oldKey);
          migrated = true;
        }
      }
    }

    // Migrar sicaad_user_settings_global si existe
    const globalData = localStorage.getItem('sicaad_user_settings_global');
    if (globalData) {
      try {
        const globalSettings = JSON.parse(globalData);
        Object.assign(settings, globalSettings);
        localStorage.removeItem('sicaad_user_settings_global');
        migrated = true;
      } catch (error) {
      }
    }

    // Migrar configuraciones específicas de usuario
    const userRegex = /^sicaad_user_settings_(?!global)(.+)$/;
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      const match = key.match(userRegex);
      if (match) {
        try {
          const userData = localStorage.getItem(key);
          if (userData) {
            const userSettings = JSON.parse(userData);
            // Tomar solo theme y sidebarCollapsed si existen
            if (userSettings.theme) settings.theme = userSettings.theme;
            if (userSettings.sidebarCollapsed !== undefined) {
              settings.sidebarCollapsed = userSettings.sidebarCollapsed;
            }
            localStorage.removeItem(key);
            migrated = true;
          }
        } catch (error) {
        }
      }
    }

    if (migrated) {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }
  }
}
