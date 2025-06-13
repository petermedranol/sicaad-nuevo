import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { Router } from '@angular/router';
import { LucideAngularModule, Mail, Lock, LogIn, Eye, EyeOff, Sun, Moon, Clock } from 'lucide-angular';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnInit {
  email = '';
  password = '';
  error = '';
  isLoading = false;
  showPassword = false;
  
  // Servicios
  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService); // Público para template
  
  // Iconos disponibles en el template
  readonly mailIcon = Mail;
  readonly lockIcon = Lock;
  readonly loginIcon = LogIn;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly clockIcon = Clock;

  ngOnInit() {
    console.log('🔐 Login Page inicializada');
    // El tema automático ya se configuró en el ThemeService al cargar la página
  }

  onLogin() {
    if (this.isLoading) return;
    
    this.error = '';
    this.isLoading = true;
    
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Credenciales inválidas o error del servidor';
      }
    });
  }
  
  /**
   * Toggle simple entre modo claro/oscuro
   */
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
