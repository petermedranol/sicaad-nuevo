import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  logout() {
    this.authService.logout()
      .then(() => {
        localStorage.removeItem('auth_token'); // opcional
        this.router.navigate(['/login']);
      })
      .catch((err: any) => {
        console.error('Error al cerrar sesión:', err);
        this.router.navigate(['/login']);
      });
  }
}
