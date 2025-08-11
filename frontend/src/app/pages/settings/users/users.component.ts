import { Component, inject, OnInit, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { TopbarService } from '@shared/services/topbar.service';
import { environment } from '@environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus } from 'lucide-angular';

// === Servicios ===
import { NotificationService } from '@shared/services/notification.service';
import { PageTitleService } from '@shared/services/page-title.service';
import { ImageProcessorService } from '@shared/services/image-processor.service';
import { UsersService } from './users.service';

// === Tipos y configuraciones ===
import { User, USER_CONSTANTS } from './types';
import { createUsersTableConfig } from './config/users-table.config';

// === Componentes ===
import { DataTableComponent, DataTableConfig } from '@shared/components/data-table';
import { PhotoUploadComponent, PhotoUploadConfig } from '@shared/components/photo-upload';
import { UserFormComponent } from './components';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DataTableComponent,
    PhotoUploadComponent,
    UserFormComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit {
  // === Referencias ===
  @ViewChild('dataTable') dataTable!: DataTableComponent;
  @ViewChild('photoUpload') photoUpload!: PhotoUploadComponent;

  // === Servicios ===
  private readonly topbarService = inject(TopbarService);
  private readonly notification = inject(NotificationService);
  private readonly pageTitle = inject(PageTitleService);
  private readonly imageProcessor = inject(ImageProcessorService);
  private readonly usersService = inject(UsersService);

  // === Constantes ===
  protected readonly environment = environment;

  // === Estado con signals para mejor rendimiento ===
  public showCreateForm = signal(false);
  public isEditMode = signal(false);
  public editingUser = signal<User | null>(null);

  // === Photo Upload ===
  public showPhotoUpload = signal(false);
  public photoUploadConfig = signal<PhotoUploadConfig | null>(null);

  // === Icons ===
  protected readonly icons = { Plus };

  // === Configuración de la tabla ===
  public tableConfig: DataTableConfig<User> = createUsersTableConfig(
    (user: User) => this.editUser(user),
    (user: User) => this.deleteUser(user),
    (user: User) => this.captureUserPhoto(user)
  );

  ngOnInit(): void {
    this.setupPage();
  }

  private setupPage(): void {
    // Configurar topbar
    this.topbarService.updateTopbar({
      title: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      buttons: [
        {
          label: 'Nuevo Usuario',
          icon: Plus,
          onClick: () => this.createUser(),
          variant: 'secondary'
        }
      ]
    });

    this.pageTitle.setTitle('Usuarios');

    // Forzar recarga después de un breve delay para asegurar que la configuración esté lista
    setTimeout(() => {
      if (this.dataTable) {
        this.dataTable.refresh();
      }
    }, 100);
  }

  public createUser(): void {
    this.isEditMode.set(false);
    this.editingUser.set(null);
    this.showCreateForm.set(true);
  }

  public editUser(user: User): void {
    this.isEditMode.set(true);
    this.editingUser.set(user);
    this.showCreateForm.set(true);
  }

  public onFormCancel(): void {
    this.showCreateForm.set(false);
    this.isEditMode.set(false);
    this.editingUser.set(null);
  }

  public onFormSuccess(): void {
    this.showCreateForm.set(false);
    this.isEditMode.set(false);
    this.editingUser.set(null);
    this.refreshTable();
  }

  /**
   * Abre el formulario de carga de fotos para un usuario
   * @param user Usuario al que se le asignará la foto
   */
  public captureUserPhoto(user: User): void {
    this.photoUploadConfig.set({
      entityType: 'user',
      entityId: user.id,
      maxWidth: USER_CONSTANTS.PHOTO_CONFIG.MAX_WIDTH,
      maxHeight: USER_CONSTANTS.PHOTO_CONFIG.MAX_HEIGHT,
      quality: USER_CONSTANTS.PHOTO_CONFIG.QUALITY
    });
    this.showPhotoUpload.set(true);

    // Trigger the show animation only
    setTimeout(() => {
      if (this.photoUpload) {
        this.photoUpload.show();
      }
    }, 50);
  }

  /**
   * Maneja cuando se sube una nueva foto
   */
  public onPhotoUploaded(photoUrl: string): void {
    // Refrescar la tabla para mostrar la nueva foto
    if (this.dataTable) {
      this.dataTable.refresh();
    }
  }

  /**
   * Maneja cuando se cierra el modal de fotos
   */
  public onPhotoUploadClosed(): void {
    this.showPhotoUpload.set(false);
    this.photoUploadConfig.set(null);
  }

  public async deleteUser(user: User): Promise<void> {
    const confirmed = await this.notification.showConfirmation({
      title: '¿Eliminar usuario?',
      message: `¿Está seguro de eliminar al usuario "${user.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        const response = await this.usersService.deleteUser(user.id);
        if (response?.success) {
          if (this.dataTable) {
            this.dataTable.refresh();
          }
          this.notification.showSuccess('Usuario eliminado');
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        this.notification.showError('Error', 'Error al eliminar usuario');
      }
    }
  }

  public refreshTable(): void {
    if (this.dataTable) {
      this.dataTable.refresh();
    }
  }
}
