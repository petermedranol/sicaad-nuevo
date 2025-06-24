import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { User } from '../../../auth/interfaces/user.interface';
import { UserCreateFormData, UserUpdateFormData } from '../interfaces/user-form.interface';
import { SWEET_ALERT_DEFAULTS } from '../../../shared/constants/sweet-alert.constants';

@Injectable({
  providedIn: 'root'
})
export class UsersFormService {
  async showEditForm(user: User): Promise<UserUpdateFormData | undefined> {
    const { value: formValues } = await Swal.fire({
      ...SWEET_ALERT_DEFAULTS,
      title: 'Editar Usuario',
      html: this.getEditFormTemplate(user),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Usuario',
      cancelButtonText: 'Cancelar',
      width: window.innerWidth <= 768 ? '100%' : '44rem',
      padding: 0,
      customClass: {
        popup: 'user-edit-popup'
      },
      preConfirm: () => this.validateEditForm(user)
    });

    return formValues;
  }

  async showCreateForm(): Promise<UserCreateFormData | undefined> {
    const { value: formValues } = await Swal.fire({
      ...SWEET_ALERT_DEFAULTS,
      title: 'Nuevo Usuario',
      html: this.getCreateFormTemplate(),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Usuario',
      cancelButtonText: 'Cancelar',
      width: window.innerWidth <= 768 ? '100%' : '44rem',
      padding: 0,
      preConfirm: () => this.validateCreateForm()
    });

    return formValues;
  }

  private getEditFormTemplate(user: User): string {
    return `
      <form id="swal-edit-form" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <!-- Nombre -->
        <div class="form-control">
          <label class="label" for="swal-edit-name">
            <span class="label-text font-semibold">Nombre *</span>
          </label>
          <input id="swal-edit-name" class="input input-bordered w-full" value="${user.name}" placeholder="Nombre completo">
        </div>
        <!-- Email -->
        <div class="form-control">
          <label class="label" for="swal-edit-email">
            <span class="label-text font-semibold">Email *</span>
          </label>
          <input id="swal-edit-email" type="email" class="input input-bordered w-full" value="${user.email}" placeholder="usuario@dominio.com">
        </div>
        <!-- Nueva Contraseña -->
        <div class="form-control">
          <label class="label" for="swal-edit-password">
            <span class="label-text font-semibold">Nueva Contraseña</span>
          </label>
          <input id="swal-edit-password" type="password" class="input input-bordered w-full" placeholder="Dejar vacío para mantener actual">
          <span class="label-text-alt text-xs text-base-content/60">Solo llene si desea cambiar la contraseña</span>
        </div>
        <!-- Confirmar Contraseña -->
        <div class="form-control">
          <label class="label" for="swal-edit-password-confirm">
            <span class="label-text font-semibold">Confirmar Nueva Contraseña</span>
          </label>
          <input id="swal-edit-password-confirm" type="password" class="input input-bordered w-full" placeholder="Confirme la nueva contraseña">
        </div>
        <!-- Nota -->
        <div class="col-span-1 md:col-span-2 text-xs text-base-content/60 mt-1 text-center">* Campos requeridos</div>
      </form>
    `;
  }

  private getCreateFormTemplate(): string {
    return `
      <form id="swal-new-form" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <!-- Nombre -->
        <div class="form-control">
          <label class="label" for="swal-new-name">
            <span class="label-text font-semibold">Nombre *</span>
          </label>
          <input id="swal-new-name" type="text" class="input input-bordered w-full" placeholder="Nombre completo" required>
        </div>
        <!-- Email -->
        <div class="form-control">
          <label class="label" for="swal-new-email">
            <span class="label-text font-semibold">Email *</span>
          </label>
          <input id="swal-new-email" type="email" class="input input-bordered w-full" placeholder="usuario@dominio.com" required>
        </div>
        <!-- Contraseña -->
        <div class="form-control">
          <label class="label" for="swal-new-password">
            <span class="label-text font-semibold">Contraseña *</span>
          </label>
          <input id="swal-new-password" type="password" class="input input-bordered w-full" placeholder="Mínimo 8 caracteres" required>
        </div>
        <!-- Confirmar Contraseña -->
        <div class="form-control">
          <label class="label" for="swal-new-password-confirm">
            <span class="label-text font-semibold">Confirmar Contraseña *</span>
          </label>
          <input id="swal-new-password-confirm" type="password" class="input input-bordered w-full" placeholder="Repite la contraseña" required>
        </div>
        <!-- Nota -->
        <div class="col-span-1 md:col-span-2 text-xs text-base-content/60 mt-1 text-center">* Campos requeridos</div>
      </form>
    `;
  }

  private validateEditForm(user: User): UserUpdateFormData | false {
    const name = (document.getElementById('swal-edit-name') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('swal-edit-email') as HTMLInputElement)?.value.trim();
    const password = (document.getElementById('swal-edit-password') as HTMLInputElement)?.value;
    const passwordConfirm = (document.getElementById('swal-edit-password-confirm') as HTMLInputElement)?.value;

    if (!name || !email) {
      Swal.showValidationMessage('Nombre y email son requeridos');
      return false;
    }

    if (name.length < 2) {
      Swal.showValidationMessage('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.showValidationMessage('El email debe tener un formato válido');
      return false;
    }

    if (password && password.length > 0) {
      if (password.length < 8) {
        Swal.showValidationMessage('La nueva contraseña debe tener al menos 8 caracteres');
        return false;
      }

      if (password !== passwordConfirm) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }
    }

    const hasNameChange = name !== user.name;
    const hasEmailChange = email !== user.email;
    const hasPasswordChange = password && password.length > 0;
    const hasAnyChange = hasNameChange || hasEmailChange || hasPasswordChange;

    if (!hasAnyChange) {
      Swal.showValidationMessage('No se han detectado cambios para actualizar');
      return false;
    }

    const formData: UserUpdateFormData = {
      name,
      email
    };

    if (hasPasswordChange) {
      formData.password = password;
      formData.password_confirmation = passwordConfirm;
    }

    return formData;
  }

  private validateCreateForm(): UserCreateFormData | false {
    const name = (document.getElementById('swal-new-name') as HTMLInputElement)?.value.trim();
    const email = (document.getElementById('swal-new-email') as HTMLInputElement)?.value.trim();
    const password = (document.getElementById('swal-new-password') as HTMLInputElement)?.value;
    const passwordConfirm = (document.getElementById('swal-new-password-confirm') as HTMLInputElement)?.value;

    if (!name || !email || !password || !passwordConfirm) {
      Swal.showValidationMessage('Todos los campos son requeridos');
      return false;
    }

    if (name.length < 2) {
      Swal.showValidationMessage('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.showValidationMessage('El email debe tener un formato válido');
      return false;
    }

    if (password.length < 8) {
      Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (password !== passwordConfirm) {
      Swal.showValidationMessage('Las contraseñas no coinciden');
      return false;
    }

    return {
      name,
      email,
      password,
      password_confirmation: passwordConfirm
    };
  }
}
