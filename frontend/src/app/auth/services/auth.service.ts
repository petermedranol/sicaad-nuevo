import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

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
        this.http.post<User>(`${this.apiUrl}/login`, {
          email,
          password,
          recaptcha_response: recaptchaResponse,
        }, { withCredentials: true })
      ),
      tap(user => this.currentUser.set(user)), // Almacena el usuario en la señal
      tap(() => console.log('✅ Login exitoso, usuario almacenado:', this.currentUser()))
    );
  }

  /**
   * Cierra la sesión del usuario.
   * Limpia la señal de usuario y redirige al login.
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null)) // Ignora errores al desloguear
      )
      .subscribe(() => {
        this.currentUser.set(null); // Limpia el usuario
        localStorage.clear(); // Limpia el localStorage
        this.router.navigate(['/auth/login']);
        console.log('🔒 Sesión cerrada');
      });
  }

  /**
   * Verifica si hay un usuario autenticado al cargar la aplicación.
   * Llama al endpoint /api/user para obtener los datos.
   */
  checkAuthentication(): Observable<boolean> {
    return this.http.get<User>(`${this.apiUrl}/user`, { withCredentials: true }).pipe(
      map(user => {
        this.currentUser.set(user);
        console.log('🔍 Verificación de Auth exitosa, usuario recuperado:', this.currentUser());
        return true;
      }),
      catchError(() => {
        this.currentUser.set(null);
        console.log('🔍 Verificación de Auth fallida, no hay sesión.');
        return of(false);
      })
    );
  }
}
