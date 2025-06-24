import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { SWEET_ALERT_DEFAULTS, TOAST_DEFAULTS } from '../constants/sweet-alert.constants';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  async showSuccess(message: string): Promise<void> {
    await Swal.fire({
      ...SWEET_ALERT_DEFAULTS,
      ...TOAST_DEFAULTS,
      icon: 'success',
      title: message
    });
  }

  async showError(title: string, message: string): Promise<void> {
    await Swal.fire({
      ...SWEET_ALERT_DEFAULTS,
      icon: 'error',
      title,
      text: message
    });
  }

  async showConfirmation(options: ConfirmationOptions): Promise<boolean> {
    const result = await Swal.fire({
      ...SWEET_ALERT_DEFAULTS,
      title: options.title,
      text: options.message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'Confirmar',
      cancelButtonText: options.cancelText || 'Cancelar'
    });
    return result.isConfirmed;
  }

  async showLoading(title: string): Promise<void> {
    await Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }
}
