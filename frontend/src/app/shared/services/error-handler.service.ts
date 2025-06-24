import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private notificationService: NotificationService) {}

  async handleApiError(error: any, title: string): Promise<void> {
    let errorMessage = this.extractErrorMessage(error);
    await this.notificationService.showError(title, errorMessage);
  }

  private extractErrorMessage(error: any): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      return Object.values(errors).flat().join('\n');
    }
    return error.error?.message || error.message || 'Error interno del servidor';
  }
}
