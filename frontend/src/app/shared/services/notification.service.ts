import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';
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
      title: message,
      icon: 'success',
      background: '#22c55e', // Verde llamativo (Tailwind green-500)
      color: '#fff',
      ...TOAST_DEFAULTS,
      ...SWEET_ALERT_DEFAULTS
    } as SweetAlertOptions);
  }

  async showError(title: string, message: string): Promise<void> {
    await Swal.close(); // Cerrar cualquier modal abierto antes de mostrar el error
    await Swal.fire({
      title,
      text: message,
      icon: 'error',
      ...SWEET_ALERT_DEFAULTS
    } as SweetAlertOptions);
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
    } as SweetAlertOptions);
    return result.isConfirmed;
  }

  async showLoading(title: string): Promise<void> {
    await Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    } as SweetAlertOptions);
  }
}
