import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, lastValueFrom } from 'rxjs';
import { MenuNavigationService } from '../../shared/services/menu-navigation.service';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { UserSettingsService } from '../../shared/services/user-settings.service';
import { MenuService } from '../../shared/services/menu.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userSettings = inject(UserSettingsService);
  private readonly menuNavigation = inject(MenuNavigationService);
  private readonly menuService = inject(MenuService);

  private baseUrl = 'http://localhost'; // Ajusta a tu variable de entorno
  private apiUrl = `${this.baseUrl}/api`;

  // Señal para almacenar el usuario actual. Inicia en null.
  public currentUser = signal<User | null>(null);

  constructor() {
    this.checkAuthentication().subscribe();
  }

  /**
   * Realiza el login: obtiene cookie CSRF y luego intenta autenticar.
   * Si tiene éxito, almacena los datos del usuario.
   */
  login(email: string, password: string, recaptchaResponse: string): Observable<User> {
    return this.http.get(`${this.baseUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() =>
        this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
          email,
          password,
          recaptcha_response: recaptchaResponse,
        }, { withCredentials: true })
      ),
      tap(response => {
        // Guardar el usuario
        this.currentUser.set(response.user);
        
        // Limpiar las preferencias anteriores
        this.userSettings.remove();
        
        // Guardar las nuevas preferencias y asegurar que activeItem esté presente
        const preferences = {
          ...response.preferences,
          activeItem: response.preferences['activeItem'] || '1' // Default a Inicio si no hay activeItem
        };
        this.userSettings.saveAll(preferences);
        
        // Inicializar los menús
        const menuItems = this.menuService.convertApiMenusToMenuItems(response.preferences['menuItems']);
        this.menuService.setMenuItems(menuItems);
        
        // Migrar configuraciones antiguas por si acaso
        this.userSettings.migrateFromOldKeys({
          'sicaad_expanded_items': 'expandedItems',
          'sicaad_active_item': 'activeItem',
          'sicaad_menu_items': 'menuItems',
          'userMenu': 'menuItems',
          'sicaad_user_info': 'userInfo',
          'sicaad_search_query': 'searchQuery',
          'sicaad_menu_last_sync': 'lastSync',
          'sidebarCollapsed': 'sidebarCollapsed',
          'theme': 'theme'
        });
      }),
      map(response => response.user),
      tap(() => {})
    );
  }

  /**
   * Cierra la sesión del usuario.
   * Limpia la señal de usuario y redirige al login.
   */
  async logout(): Promise<void> {
    try {
      // Primero guardamos las preferencias mientras aún estamos autenticados
      await this.userSettings.saveToServer();

      // Luego hacemos logout
      await lastValueFrom(this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }));
      
      this.currentUser.set(null); // Limpia el usuario
      this.userSettings.remove(); // Limpia todas las configuraciones
      this.router.navigate(['/auth/login']);
    } catch (error) {
      // Aseguramos que el usuario sea desconectado incluso si hay error
      this.currentUser.set(null);
      this.userSettings.remove();
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Verifica si hay un usuario autenticado al cargar la aplicación.
   * Llama al endpoint /api/user para obtener los datos.
   */
  checkAuthentication(): Observable<boolean> {
    return this.http.get<User>(`${this.apiUrl}/user`, { withCredentials: true }).pipe(
      map(user => {
        this.currentUser.set(user);
        return true;
      }),
      catchError(() => {
        this.currentUser.set(null);
        return of(false);
      })
    );
  }
}
