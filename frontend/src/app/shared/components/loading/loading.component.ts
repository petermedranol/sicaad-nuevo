import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  loadingService = inject(LoadingService);

  get isVisible(): boolean {
    return this.loadingService.loadingState().isLoading;
  }

  get message(): string {
    return this.loadingService.loadingState().message;
  }

  get progress(): number {
    return this.loadingService.loadingState().progress;
  }

  get showProgress(): boolean {
    return this.loadingService.loadingState().showProgress;
  }
}

