import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost';
  private apiUrl = `${this.baseUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Realiza el login después de obtener la cookie CSRF de Sanctum
   */
  login(email: string, password: string, recaptchaResponse: string) {
    return this.http.get(`${this.baseUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() =>
        this.http.post(`${this.apiUrl}/login`, { 
          email, 
          password, 
          recaptcha_response: recaptchaResponse 
        }, { withCredentials: true })
      )
    );
  }


  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).toPromise();
  }

  checkAuth(): Promise<boolean> {
    return this.http.get(`${this.apiUrl}/user`, { withCredentials: true })
      .toPromise()
      .then(() => true)
      .catch(() => false);
  }
}
