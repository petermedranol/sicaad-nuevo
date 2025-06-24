import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

export interface ApiError {
  code?: string;
  message: string;
  errors?: Record<string, string[]>;
}

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
    // Si es un ApiError conocido
    if (error.error?.errors) {
      return Object.entries(error.error.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('\n');
    }

    // Si es un error HTTP estándar
    if (error.status) {
      switch (error.status) {
        case 401:
          return 'No está autorizado para realizar esta acción';
        case 403:
          return 'No tiene permisos para realizar esta acción';
        case 404:
          return 'El recurso solicitado no existe';
        case 422:
          return 'Los datos proporcionados no son válidos';
        case 429:
          return 'Demasiadas solicitudes. Por favor, espere un momento';
        case 500:
          return 'Error interno del servidor';
        default:
          return `Error ${error.status}: ${error.statusText}`;
      }
    }
    if (error.error?.errors) {
      const errors = error.error.errors;
      return Object.values(errors).flat().join('\n');
    }
    return error.error?.message || error.message || 'Error interno del servidor';
  }
}
