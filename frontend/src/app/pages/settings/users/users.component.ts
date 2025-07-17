import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TopbarService } from '../../../shared/services/topbar.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  Upload,
  User as UserIcon,
  Camera,
  Save,
  RotateCcw
} from 'lucide-angular';
import Swal from 'sweetalert2';

// === Servicios ===
import { NotificationService } from '../../../shared/services/notification.service';
import { PageTitleService } from '../../../shared/services/page-title.service';
import { ImageProcessorService } from '../../../shared/services/image-processor.service';
import { UsersService } from './users.service';

// === Modelos ===
interface User {
  id: number;
  name: string;
  email: string;
  photo_path?: string;
  photo_hash?: string;
  created_at: string;
}

// === DataTable ===
import { DataTableComponent, DataTableConfig } from '../../../shared/components/data-table';
import { PhotoUploadComponent, PhotoUploadConfig } from '../../../shared/components/photo-upload';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DataTableComponent,
    PhotoUploadComponent
  ],
  templateUrl: './users.component.html',
  styles: [`
    .form-container {
      transition: all 0.3s ease-in-out;
      opacity: 0;
      transform: translateY(-10px);
      overflow: hidden;
      max-height: 0;
    }

    .form-container.show {
      opacity: 1;
      transform: translateY(0);
      max-height: 1000px;
    }

    .form-container.hide {
      opacity: 0;
      transform: translateY(-10px);
      max-height: 0;
    }
  `]
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

  // Make environment accessible in template
  protected readonly environment = environment;

  // === Formulario de creación/edición ===
  showCreateForm = false;
  isClosingForm = false;
  isFormReady = false;
  creatingUser = false;
  isEditMode = false;
  editingUserId: number | null = null;
  createFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  // === Photo Upload ===
  showPhotoUpload = false;
  photoUploadConfig: PhotoUploadConfig | null = null;

  // === Icons ===
  protected readonly icons = {
    Search, Plus, Edit, Trash2, Eye, X, Check, Upload, User: UserIcon, Camera, Save, RotateCcw
  };

  // === Configuración de la tabla ===
  public tableConfig: DataTableConfig<User> = {
    // URL del endpoint
    url: '/api/users',

    // Configuración de columnas
    columns: [
      {
        field: 'photo_path',
        header: 'Foto',
        template: 'image',
        sortable: false,
        width: '50px',
        priority: 'high',
        format: (value, row?: User) => {
          if (value && row?.id) {
            return `${environment.apiUrl}/api/images/user/${row.id}/true?v=${row.photo_hash || Date.now()}`;
          }
          return '/no-image.png';
        }
      },
      {
        field: 'id',
        header: '#',
        sortable: true,
        width: '60px',
        priority: 'high'
      },
      {
        field: 'name',
        header: 'Nombre',
        sortable: true,
        searchable: true,
        priority: 'high'
      },
      {
        field: 'email',
        header: 'Email',
        sortable: true,
        searchable: true,
        priority: 'medium'
      },
      {
        field: 'created_at',
        header: 'Fecha Creación',
        template: 'date',
        sortable: true,
        width: '150px',
        priority: 'low'
      }
    ],

    // Configuración de búsqueda
    searchable: true,
    searchPlaceholder: 'Buscar usuarios...',

    // Configuración de paginación
    pagination: true,
    itemsPerPageOptions: [5, 10, 15, 25, 50],
    defaultItemsPerPage: 5,

    // Configuración de ordenamiento por defecto
    defaultSort: {
      field: 'id',
      order: 'DESC'
    },

    // Configuración de diseño
    showHeader: true,
    striped: true,
    hoverable: true,
    responsive: true,

    // Acciones disponibles
    actions: [
      {
        label: 'Tomar Foto',
        icon: Camera,
        onClick: (row: User) => this.captureUserPhoto(row)
      },
      {
        label: 'Editar',
        icon: Edit,
        onClick: (row: User) => this.editUser(row),
        primary: true
      },
      {
        label: 'Eliminar',
        icon: Trash2,
        onClick: (row: User) => this.deleteUser(row)
      }
    ]
  };

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

  public async createUser(): Promise<void> {
    this.isEditMode = false;
    this.editingUserId = null;
    this.showCreateForm = true;
    this.isFormReady = false;
    this.resetCreateForm();

    // Pequeño delay para permitir que Angular renderice el elemento antes de aplicar la animación
    setTimeout(() => {
      this.isFormReady = true;

      // Enfocar el primer campo después de que se complete la animación
      setTimeout(() => {
        const nameInput = document.getElementById('create-name');
        if (nameInput) {
          nameInput.focus();
        }
      }, 100);
    }, 50);
  }

  /**
   * Reinicia los datos del formulario de creación.
   */
  private resetCreateForm(): void {
    this.createFormData = {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    };
  }

  /**
   * Cancela la creación/edición de usuario y oculta el formulario.
   */
  cancelCreateUser(): void {
    this.isClosingForm = true;
    // Esperar a que termine la animación de salida antes de ocultar
    setTimeout(() => {
      this.showCreateForm = false;
      this.isClosingForm = false;
      this.isFormReady = false;
      this.isEditMode = false;
      this.editingUserId = null;
      this.resetCreateForm();
    }, 300); // Duración de la animación
  }

  /**
   * Maneja el envío del formulario de creación/edición de usuario.
   */
  async submitCreateUser(event: Event): Promise<void> {
    event.preventDefault();

    // Validaciones para modo creación o si se está cambiando contraseña en edición
    if (!this.isEditMode || (this.createFormData.password || this.createFormData.password_confirmation)) {
      // Validar que las contraseñas coincidan
      if (this.createFormData.password !== this.createFormData.password_confirmation) {
        this.notification.showError('Error', 'Las contraseñas no coinciden');
        return;
      }

      // Validar longitud mínima de contraseña solo si se está proporcionando
      if (this.createFormData.password && this.createFormData.password.length < 8) {
        this.notification.showError('Error', 'La contraseña debe tener al menos 8 caracteres');
        return;
      }
    }

    this.creatingUser = true;
    try {
      let response;

      if (this.isEditMode && this.editingUserId) {
        // Modo edición
        const updateData: any = {
          name: this.createFormData.name,
          email: this.createFormData.email
        };

        // Solo incluir contraseña si se proporcionó
        if (this.createFormData.password) {
          updateData.password = this.createFormData.password;
          updateData.password_confirmation = this.createFormData.password_confirmation;
        }

        response = await this.usersService.updateUser(this.editingUserId, updateData);
      } else {
        // Modo creación
        response = await this.usersService.createUser(this.createFormData);
      }

      if (response?.success) {
        // Cerrar formulario inmediatamente
        this.isClosingForm = true;
        setTimeout(() => {
          this.showCreateForm = false;
          this.isClosingForm = false;
          this.isFormReady = false;
          this.isEditMode = false;
          this.editingUserId = null;
          this.resetCreateForm();
        }, 300);

        // Refrescar tabla
        if (this.dataTable) {
          this.dataTable.refresh();
        }

        // Mostrar toast informativo (no bloqueante)
        this.notification.showSuccess(
          this.isEditMode ? '¡Usuario actualizado!' : '¡Usuario creado!'
        );
      } else {
        throw new Error(response?.message || 'Error desconocido');
      }
    } catch (error) {
      // Mostrar toast de error (no bloqueante)
      this.notification.showError('Error',
        this.isEditMode ? 'Error al actualizar usuario' : 'Error al crear usuario'
      );
    } finally {
      this.creatingUser = false;
    }
  }

  /**
   * Abre el formulario de carga de fotos para un usuario
   * @param user Usuario al que se le asignará la foto
   */
  async captureUserPhoto(user: User): Promise<void> {
    this.photoUploadConfig = {
      entityType: 'user',
      entityId: user.id,
      maxWidth: 400,    // Más pequeño - como avatar
      maxHeight: 400,   // Cuadrado para fotos de perfil
      quality: 0.8      // Buena calidad pero comprimido
    };
    this.showPhotoUpload = true;

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
  onPhotoUploaded(photoUrl: string): void {
    // Refrescar la tabla para mostrar la nueva foto
    if (this.dataTable) {
      this.dataTable.refresh();
    }
  }

  /**
   * Maneja cuando se cierra el modal de fotos
   */
  onPhotoUploadClosed(): void {
    this.showPhotoUpload = false;
    this.photoUploadConfig = null;
  }

  public async editUser(user: User): Promise<void> {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.showCreateForm = true;
    this.isFormReady = false;

    // Llenar el formulario con los datos del usuario
    this.createFormData = {
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: ''
    };

    // Pequeño delay para permitir que Angular renderice el elemento antes de aplicar la animación
    setTimeout(() => {
      this.isFormReady = true;

      // Enfocar el primer campo después de que se complete la animación
      setTimeout(() => {
        const nameInput = document.getElementById('create-name');
        if (nameInput) {
          nameInput.focus();
        }
      }, 100);
    }, 50);
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
