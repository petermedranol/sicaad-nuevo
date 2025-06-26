import { Component, inject, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { Router } from '@angular/router';
import { LucideAngularModule, Mail, Lock, LogIn, Eye, EyeOff, Sun, Moon, Clock } from 'lucide-angular';
import { UserSettingsService } from '../../../shared/services/user-settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timeouts: number[] = [];
  // Form data
  email = '';
  password = '';
  error = '';
  isLoading = false;
  showPassword = false;

  // reCAPTCHA state
  recaptchaResponse = '';
  recaptchaLoaded = false;
  private recaptchaWidgetId: number | null = null;
  private readonly RECAPTCHA_SITE_KEY = environment.recaptcha.siteKey;

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private userSettings = inject(UserSettingsService);
  themeService = inject(ThemeService);

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
    this.loadRecaptchaScript();
  }

  ngOnDestroy() {
    // Limpiar todos los timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    
    // Completar el subject de destroy
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiar el script de reCAPTCHA
    this.removeRecaptchaScript();
  }

  private loadRecaptchaScript(): void {
    if (this.document.getElementById('recaptcha-script')) {
      this.initializeRecaptcha();
      return;
    }

    const script = this.renderer.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;

    // Callback global para cuando se carga reCAPTCHA
    (window as any).onRecaptchaLoad = () => {
      this.initializeRecaptcha();
    };

    this.renderer.appendChild(this.document.head, script);
  }

  private initializeRecaptcha(): void {
    if (typeof (window as any).grecaptcha !== 'undefined' && !this.recaptchaLoaded) {
      this.recaptchaLoaded = true;
      const timeoutId = setTimeout(() => {
        this.renderRecaptcha();
      }, 100);
    }
  }

  private renderRecaptcha(): void {
    const recaptchaElement = this.document.getElementById('recaptcha-container');
    if (recaptchaElement && typeof (window as any).grecaptcha !== 'undefined') {
      this.recaptchaWidgetId = (window as any).grecaptcha.render('recaptcha-container', {
        sitekey: this.RECAPTCHA_SITE_KEY,
        callback: (response: string) => {
          this.recaptchaResponse = response;
        },
        'expired-callback': () => {
          this.recaptchaResponse = '';
        },
        'error-callback': () => {
          this.recaptchaResponse = '';
          this.error = 'Error al cargar reCAPTCHA. Por favor, recarga la página.';
        }
      });
    }
  }

  private removeRecaptchaScript(): void {
    const script = this.document.getElementById('recaptcha-script');
    if (script) {
      script.remove();
    }
    delete (window as any).onRecaptchaLoad;
    delete (window as any).grecaptcha;
  }

  private resetRecaptcha(): void {
    if (this.recaptchaWidgetId !== null && typeof (window as any).grecaptcha !== 'undefined') {
      (window as any).grecaptcha.reset(this.recaptchaWidgetId);
      this.recaptchaResponse = '';
    }
  }

  onLogin() {
    if (this.isLoading) return;

    this.error = '';

    // Validar reCAPTCHA
    if (!this.recaptchaResponse) {
      this.error = 'Por favor, completa la verificación reCAPTCHA.';
      return;
    }

    this.isLoading = true;

    // Paso 1: Validar credenciales
    this.loadingService.showValidatingCredentials();

    this.authService.login(this.email, this.password, this.recaptchaResponse).subscribe({
      next: async () => {
        // Paso 2: Acceso concedido
        this.loadingService.showLoginSuccess();

    const timeoutId = setTimeout(() => {
          // Obtener el activeItem y su ruta correspondiente de las preferencias
          const preferences = this.userSettings.getAll();
          const activeItemId = preferences?.activeItem;
          
          // Buscar el menú correspondiente y su ruta
          const menuItems = preferences?.menuItems || [];
          const findRouteById = (items: any[], id: string): string | null => {
            for (const item of items) {
              if (item.id.toString() === id) return item.link;
              if (item.children) {
                const route = findRouteById(item.children, id);
                if (route) return route;
              }
            }
            return null;
          };
          
          // Obtener la ruta basada en el activeItem o usar dashboard como fallback
          const route = activeItemId ? findRouteById(menuItems, activeItemId) : null;
          
          // Navegar a la ruta encontrada o al dashboard por defecto
          this.router.navigate([route || '/dashboard']);
          
          // Paso 4: Ocultar loading después de la navegación
          const timeoutId = setTimeout(() => {
            this.loadingService.hide();
            this.isLoading = false;
          }, 800);
        }, 600);
      },
      error: () => {
        // Ocultar loading en caso de error
        this.loadingService.hide();
        this.isLoading = false;
        this.error = 'Credenciales inválidas o error del servidor';
        // Reset reCAPTCHA para nueva validación
        this.resetRecaptcha();
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
