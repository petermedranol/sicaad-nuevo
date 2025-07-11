import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { NavigationLoadingService } from './shared/services/navigation-loading.service';
import { ThemeService } from './shared/services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  // Services
  navigationLoadingService = inject(NavigationLoadingService);
  themeService = inject(ThemeService);

  constructor() {
    
  }
}
