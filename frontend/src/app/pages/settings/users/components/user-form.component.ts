import { Component, signal, input, output, inject, ChangeDetectionStrategy, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, X } from 'lucide-angular';
import { NotificationService } from '@shared/services/notification.service';
import { UsersService } from '../users.service';
import { User, UserFormData, USER_CONSTANTS } from '../types/users.types';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent {
  // === Inputs ===
  public isVisible = input<boolean>(false);
  public isEditMode = input<boolean>(false);
  public editingUser = input<User | null>(null);

  // === Outputs ===
  public onCancel = output<void>();
  public onSuccess = output<void>();

  // === Servicios ===
  private readonly notification = inject(NotificationService);
  private readonly usersService = inject(UsersService);

  // === Estado ===
  public submitting = signal(false);
  public formDataSignal = signal<UserFormData>(this.getInitialFormData());
  public originalData = signal<UserFormData | null>(null);

  // === Computed properties ===
  public hasChanges = computed(() => {
    const current = this.formDataSignal();
    const original = this.originalData();

    if (!original || !this.isEditMode()) {
      // En modo creación, considerar que hay cambios si algún campo tiene datos
      return current.name.trim() !== '' ||
             current.email.trim() !== '' ||
             current.password.trim() !== '' ||
             current.password_confirmation.trim() !== '';
    }

    // En modo edición, comparar con los datos originales
    return current.name !== original.name ||
           current.email !== original.email ||
           current.password.trim() !== '' ||
           current.password_confirmation.trim() !== '';
  });

  public isFormValid = computed(() => {
    const data = this.formDataSignal();
    const hasPasswordData = data.password.trim() !== '' || data.password_confirmation.trim() !== '';

    // Validaciones básicas
    if (!data.name.trim() || !data.email.trim()) {
      return false;
    }

    // Si hay datos de contraseña, validar que coincidan y cumplan longitud mínima
    if (hasPasswordData) {
      if (data.password !== data.password_confirmation) {
        return false;
      }
      if (data.password.length < this.MIN_PASSWORD_LENGTH) {
        return false;
      }
    }

    // En modo creación, la contraseña es obligatoria
    if (!this.isEditMode() && !data.password.trim()) {
      return false;
    }

    return true;
  });

  public canSubmit = computed(() => {
    return this.isFormValid() && this.hasChanges() && !this.submitting();
  });

  // === Constantes ===
  protected readonly icons = { Save, X };
  protected readonly MIN_PASSWORD_LENGTH = USER_CONSTANTS.MIN_PASSWORD_LENGTH;

  // === Datos del formulario ===
  public get formData(): UserFormData {
    return this.formDataSignal();
  }

  public set formData(value: UserFormData) {
    this.formDataSignal.set(value);
  }

  /**
   * Actualiza un campo específico del formulario
   */
  public updateField(field: keyof UserFormData, value: string): void {
    const currentData = this.formDataSignal();
    this.formDataSignal.set({
      ...currentData,
      [field]: value
    });
  }

  /**
   * Helper para manejar eventos de input
   */
  public onFieldChange(field: keyof UserFormData, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.updateField(field, target.value);
    }
  }

  constructor() {
    // Detectar cambios en editingUser y llenar el formulario
    effect(() => {
      const user = this.editingUser();
      if (this.isEditMode() && user) {
        const userData = {
          name: user.name,
          email: user.email,
          password: '',
          password_confirmation: ''
        };
        this.formDataSignal.set(userData);
        this.originalData.set({ ...userData }); // Guardar datos originales
      } else if (!this.isEditMode()) {
        const initialData = this.getInitialFormData();
        this.formDataSignal.set(initialData);
        this.originalData.set(null);
      }
    });
  }

  private getInitialFormData(): UserFormData {
    return {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    };
  }

  public cancel(): void {
    this.onCancel.emit();
    const initialData = this.getInitialFormData();
    this.formDataSignal.set(initialData);
    this.originalData.set(null);
  }

  public async submit(event: Event): Promise<void> {
    event.preventDefault();

    // Verificar si hay cambios antes de enviar
    if (!this.hasChanges()) {
      this.notification.showError('Sin cambios', 'No se han realizado cambios en el formulario');
      return;
    }

    // Verificar si el formulario es válido
    if (!this.isFormValid()) {
      this.notification.showError('Error', 'Por favor, complete todos los campos requeridos correctamente');
      return;
    }

    const currentData = this.formDataSignal();

    this.submitting.set(true);

    try {
      let response;
      const user = this.editingUser();

      if (this.isEditMode() && user) {
        // Modo edición
        const updateData: any = {
          name: currentData.name,
          email: currentData.email
        };

        // Solo incluir contraseña si se proporcionó
        if (currentData.password) {
          updateData.password = currentData.password;
          updateData.password_confirmation = currentData.password_confirmation;
        }

        response = await this.usersService.updateUser(user.id, updateData);
      } else {
        // Modo creación
        response = await this.usersService.createUser(currentData);
      }

      if (response?.success) {
        this.notification.showSuccess(
          this.isEditMode() ? '¡Usuario actualizado!' : '¡Usuario creado!'
        );

        // Emitir evento de éxito y luego cerrar
        this.onSuccess.emit();
        this.cancel();
      } else {
        throw new Error(response?.message || 'Error desconocido');
      }
    } catch (error) {
      this.notification.showError('Error',
        this.isEditMode() ? 'Error al actualizar usuario' : 'Error al crear usuario'
      );
    } finally {
      this.submitting.set(false);
    }
  }

  public get submitButtonText(): string {
    if (this.submitting()) {
      return this.isEditMode() ? 'Actualizando...' : 'Creando...';
    }

    // Si estamos en modo edición y no hay cambios, mostrar "Sin cambios"
    if (this.isEditMode() && !this.hasChanges()) {
      return 'Sin cambios';
    }

    return this.isEditMode() ? 'Actualizar' : 'Crear';
  }
}
