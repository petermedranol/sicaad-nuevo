import { Component, inject, effect, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TopbarService } from '../../../shared/services/topbar.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  Upload,
  Save,
  X
} from 'lucide-angular';
import Swal from 'sweetalert2';

import { User } from '../../../auth/interfaces/user.interface';
import {
  ErrorHandlerService,
  NotificationService,
  PageTitleService,
  BaseTableComponent
} from '../../../shared';
import { PaginationService } from '../../../shared/services/pagination.service';
import { ImageProcessorService } from '../../../shared/services/image-processor.service';

import {
  UsersFormService,
  UsersService,
  USER_TABLE_CONFIG
} from './';

/**
 * Componente para la gestión de usuarios del sistema.
 * Permite listar, buscar, crear, editar y eliminar usuarios.
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent extends BaseTableComponent<User> implements OnInit, OnDestroy {
  // === Memory Leak Prevention ===
  private cleanupEventListeners: (() => void)[] = [];
  private timeouts: number[] = [];

  // === Servicios ===
  private readonly usersService = inject(UsersService);
  private readonly usersFormService = inject(UsersFormService);
  private readonly topbarService = inject(TopbarService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly notification = inject(NotificationService);
  private readonly pageTitle = inject(PageTitleService);
  private readonly paginationService = inject(PaginationService);
private readonly imageProcessor = inject(ImageProcessorService);

  // Make environment accessible in template
  protected readonly environment = environment;

  // === Iconos ===
  readonly searchIcon = Search;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly resetIcon = RotateCcw;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly plusIcon = Plus;
  readonly sortAscIcon = ArrowUp;
  readonly sortDescIcon = ArrowDown;
  readonly cameraIcon = Camera;
  readonly uploadIcon = Upload;
  readonly saveIcon = Save;
  readonly xIcon = X;

  // === Configuración de tabla ===
  override config = USER_TABLE_CONFIG;

  // === Formulario de creación/edición ===
  showCreateForm = false;
  isClosingForm = false;
  isFormReady = false;
  creatingUser = false;
  isEditMode = false; // Nueva propiedad para modo edición
  editingUserId: number | null = null; // ID del usuario siendo editado
  createFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  constructor() {
    super();
    this.state.update(state => ({
      ...state,
      sortField: this.config.defaultSort.field as string,
      sortOrder: this.config.defaultSort.order
    }));
  }

  /**
   * Limpia todos los recursos para prevenir memory leaks.
   */
  override ngOnDestroy() {
    // Limpiar event listeners
    this.cleanupEventListeners.forEach(cleanup => cleanup());
    this.cleanupEventListeners = [];

    // Limpiar timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    // Llamar al ngOnDestroy del parent que maneja destroy$
    super.ngOnDestroy();
  }

  /**
   * Agrega un event listener con limpieza automática.
   */
  private addEventListenerWithCleanup(element: EventTarget, event: string, handler: EventListener) {
    element.addEventListener(event, handler);
    this.cleanupEventListeners.push(() => element.removeEventListener(event, handler));
  }

  /**
   * Crea un timeout con limpieza automática.
   */
  private addSafeTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(callback, delay);
    this.timeouts.push(id);
    return id;
  }

  /**
   * Inicializa el componente y actualiza la barra superior y el título de la página.
   */
  override ngOnInit() {
    super.ngOnInit();
    this.topbarService.updateTopbar({
      title: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      buttons: [
        {
          label: 'Nuevo Usuario',
          icon: this.plusIcon,
          onClick: () => this.createUser(),
          variant: 'secondary'
        }
      ]
    });
    this.pageTitle.setTitle('Usuarios');
  }

  /**
   * Carga usuarios desde el servidor con paginación y filtros.
   */
  override async loadData(): Promise<void> {
    this.setLoading(true);
    try {
      const filters = this.tableService.createFilters(this.state());
      const response = await this.usersService.getUsers(filters);

      // Verificar que la respuesta sea válida
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      if (response.success) {
        this.data.set(response.data.users);
        this.state.update(state => ({
          ...state,
          totalRecords: response.data.pagination.total_records,
          totalPages: response.data.pagination.total_pages
        }));
      } else {
        throw new Error(response?.message || 'Error en respuesta del servidor');
      }
    } catch (error) {
      await this.errorHandler.handleApiError(error, 'Error cargando usuarios');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Maneja eventos de input en el campo de búsqueda.
   * @param event Evento de input del campo de búsqueda.
   */
  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    super.onSearch(input.value);
  }

  /**
   * Cambia el número de elementos por página.
   * @param event Evento del select.
   */
  handleItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value);
    super.onItemsPerPageChange(newLimit);
  }

  /**
   * Limpia la búsqueda.
   */
  override clearSearch() {
    super.onSearch('');
  }

  /**
   * Navega a una página específica.
   * @param page Número de página.
   */
  goToPage(page: number) {
    super.onPageChange(page);
  }

  /**
   * Ordena por campo específico.
   * @param field Campo por el que se ordena.
   */
  sortBy(field: keyof User) {
    super.onSort(field as keyof User);
  }

  /**
   * Elimina un usuario tras confirmación.
   * @param user Usuario a eliminar.
   */
  /**
   * Abre el diálogo para capturar o subir una foto de usuario
   * @param user Usuario al que se le asignará la foto
   */
  async captureUserPhoto(user: User) {
    let photo: string | null = null;
    let stream: MediaStream | null = null;
    let cleanupListeners: (() => void)[] = [];

    // Función para limpiar el stream y los recursos
    const cleanup = () => {
      try {
        // Limpiar stream de la cámara
        if (stream) {
          stream.getTracks().forEach(track => {
            track.enabled = false;
            track.stop();
          });
          stream = null;
        }

        // Remover todos los event listeners registrados
        cleanupListeners.forEach(removeFn => removeFn());
        cleanupListeners = [];

        // Remover el listener de beforeunload
        window.removeEventListener('beforeunload', cleanup);

        // Limpiar referencias a elementos del DOM
        const video = Swal.getPopup()?.querySelector('#webcam-video') as HTMLVideoElement;
        if (video) {
          video.srcObject = null;
        }
      } catch (error) {
      }
    };

    const result = await Swal.fire({
      title: 'Foto de Usuario',
      html: `
        <div class="space-y-4">
          <div class="flex flex-col items-center gap-4">
            <div class="flex gap-4">
              <button type="button" class="btn btn-primary gap-2" id="webcam-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                Tomar Foto
              </button>
              <label class="btn btn-secondary gap-2" role="button" tabindex="0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Subir Imagen
                <input type="file" accept="image/*" class="hidden" id="file-input">
              </label>
            </div>
            <div class="text-sm text-base-content/70 text-center hidden" id="camera-instructions">
              Cuando estés listo, presiona el botón "Capturar" para tomar la foto
            </div>
          </div>

          <div id="preview-container" class="hidden space-y-2">
            <div class="text-sm text-base-content/70 text-center">
              Vista previa de la foto
            </div>
            <img id="preview-image" class="max-w-[350px] mx-auto rounded-lg shadow-lg" alt="Vista previa">
          </div>

          <div id="camera-container" class="hidden space-y-2">
            <div class="text-sm text-base-content/70 text-center">
              Vista de la cámara
            </div>
            <video id="webcam-video" class="max-w-[350px] mx-auto rounded-lg shadow-lg"></video>
          </div>
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: true,
      showDenyButton: false,
      confirmButtonText: `<span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Guardar</span>`,
      cancelButtonText: `<span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Cancelar</span>`,
      showClass: {
        popup: 'swal2-noanimation',
        backdrop: 'swal2-noanimation'
      },
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-primary gap-2',
        cancelButton: 'btn btn-ghost gap-2'
      },
      width: 'auto',
      willClose: () => {
        cleanup();
      },
      didOpen: async (modalElement) => {
        const confirmButton = Swal.getConfirmButton();
        if (confirmButton) confirmButton.classList.add('hidden');
        const webcamBtn = Swal.getPopup()?.querySelector('#webcam-btn') as HTMLButtonElement;
        const cameraInstructions = Swal.getPopup()?.querySelector('#camera-instructions') as HTMLDivElement;
        const cameraContainer = Swal.getPopup()?.querySelector('#camera-container') as HTMLDivElement;
        const fileInput = Swal.getPopup()?.querySelector('#file-input') as HTMLInputElement;
        const previewContainer = Swal.getPopup()?.querySelector('#preview-container') as HTMLDivElement;
        const previewImage = Swal.getPopup()?.querySelector('#preview-image') as HTMLImageElement;
        const video = Swal.getPopup()?.querySelector('#webcam-video') as HTMLVideoElement;


        // Función para procesar la imagen
        const processImage = async (imageData: string | File) => {
          try {
            const resizedImage = await this.imageProcessor.resizeImage(imageData);
              previewImage.src = resizedImage;
              previewContainer.classList.remove('hidden');
              cameraContainer.classList.add('hidden');
              cameraInstructions.classList.add('hidden');
            Swal.enableButtons();
            Swal.getConfirmButton()?.classList.remove('hidden');
            return resizedImage;
          } catch (error) {
            await this.notification.showError('Error', 'Error al procesar la imagen');
            return null;
          }
        };

        // Manejador para subida de archivo
        const handleFileInput = async (e: Event) => {
          const files = (e.target as HTMLInputElement).files;
          if (files?.length) {
            await processImage(files[0]);
          }
        };
        this.addEventListenerWithCleanup(fileInput, 'change', handleFileInput);

        // Manejador para webcam
        webcamBtn.addEventListener('click', async () => {
          try {
            if (!stream) {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  width: { ideal: 350 },
                  height: { ideal: 350 },
                  facingMode: 'user'
                }
              });
              video.srcObject = stream;
              cameraContainer.classList.remove('hidden');
              previewContainer.classList.add('hidden');
              cameraInstructions.classList.remove('hidden');
              webcamBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> Capturar';
              await video.play();
            } else {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0);
                const photoData = canvas.toDataURL('image/jpeg', 0.8);
                // Limpiar el contexto del canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                await processImage(photoData);
              }
              cleanup();
              webcamBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> Tomar Nueva Foto';
            }
          } catch (error) {
            await this.notification.showError('Error', 'Error al acceder a la cámara');
          }
        });        // Limpiar en todos los eventos posibles de cierre
        this.addEventListenerWithCleanup(modalElement, 'cancel', cleanup);
        this.addEventListenerWithCleanup(modalElement, 'confirm', cleanup);
        this.addEventListenerWithCleanup(window, 'beforeunload', cleanup);
      },
      preConfirm: () => {
        const previewImage = Swal.getPopup()?.querySelector('#preview-image') as HTMLImageElement;
        return previewImage?.src || null;
      }
    });

    if (result.isConfirmed && result.value) {
      photo = result.value;
    }

    if (photo) {
      try {
        const response = await this.usersService.updateUserPhoto(user.id, photo);
        if (response?.success) {
          await this.loadData();
          await this.notification.showSuccess('Foto actualizada con éxito');
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        await this.errorHandler.handleApiError(error, 'Error al actualizar la foto');
      }
    }
  }

  async deleteUser(user: User): Promise<void> {
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
          await this.loadData();
          await this.notification.showSuccess('Usuario eliminado');
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        await this.errorHandler.handleApiError(error, 'Error al eliminar usuario');
      }
    }
  }

  /**
   * Edita un usuario.
   * @param user Usuario a editar.
   */
  async editUser(user: User): Promise<void> {
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
    this.addSafeTimeout(() => {
      this.isFormReady = true;

      // Enfocar el primer campo después de que se complete la animación
      this.addSafeTimeout(() => {
        const nameInput = document.getElementById('create-name');
        if (nameInput) {
          nameInput.focus();
        }
      }, 100);
    }, 50);
  }

  /**
   * Crea un nuevo usuario.
   */
  async createUser(): Promise<void> {
    this.isEditMode = false;
    this.editingUserId = null;
    this.showCreateForm = true;
    this.isFormReady = false;
    this.resetCreateForm();

    // Pequeño delay para permitir que Angular renderice el elemento antes de aplicar la animación
    this.addSafeTimeout(() => {
      this.isFormReady = true;

      // Enfocar el primer campo después de que se complete la animación
      this.addSafeTimeout(() => {
        const nameInput = document.getElementById('create-name');
        if (nameInput) {
          nameInput.focus();
        }
      }, 100);
    }, 50);
  }

  /**
   * Cancela la creación/edición de usuario y oculta el formulario.
   */
  cancelCreateUser(): void {
    this.isClosingForm = true;
    // Esperar a que termine la animación de salida antes de ocultar
    this.addSafeTimeout(() => {
      this.showCreateForm = false;
      this.isClosingForm = false;
      this.isFormReady = false;
      this.isEditMode = false;
      this.editingUserId = null;
      this.resetCreateForm();
    }, 300); // Duración de la animación
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
   * Maneja el envío del formulario de creación/edición de usuario.
   */
  async submitCreateUser(event: Event): Promise<void> {
    event.preventDefault();

    // Validaciones para modo creación o si se está cambiando contraseña en edición
    if (!this.isEditMode || (this.createFormData.password || this.createFormData.password_confirmation)) {
      // Validar que las contraseñas coincidan
      if (this.createFormData.password !== this.createFormData.password_confirmation) {
        await this.notification.showError('Error', 'Las contraseñas no coinciden');
        return;
      }

      // Validar longitud mínima de contraseña solo si se está proporcionando
      if (this.createFormData.password && this.createFormData.password.length < 8) {
        await this.notification.showError('Error', 'La contraseña debe tener al menos 8 caracteres');
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
        await this.loadData();
        await this.notification.showSuccess(
          this.isEditMode ? '¡Usuario actualizado!' : '¡Usuario creado!'
        );
        this.isClosingForm = true;
        // Animación de salida antes de cerrar
        this.addSafeTimeout(() => {
          this.showCreateForm = false;
          this.isClosingForm = false;
          this.isFormReady = false;
          this.isEditMode = false;
          this.editingUserId = null;
          this.resetCreateForm();
        }, 300);
      } else {
        throw new Error(response?.message || 'Error desconocido');
      }
    } catch (error) {
      await this.errorHandler.handleApiError(
        error,
        this.isEditMode ? 'Error al actualizar usuario' : 'Error al crear usuario'
      );
    } finally {
      this.creatingUser = false;
    }
  }

  /**
   * Retorna solo las columnas visibles de la tabla.
   */
  get visibleColumns() {
    return this.config.columns.filter(column => column.visible);
  }

  /**
   * Devuelve el rango de páginas para la paginación
   */
  override get pageNumbers(): number[] {
    return this.paginationService.calculatePageRange({
      current_page: this.state().currentPage,
      total_pages: this.state().totalPages,
      per_page: this.state().itemsPerPage,
      total_records: this.state().totalRecords,
      has_next_page: this.state().currentPage < this.state().totalPages,
      has_previous_page: this.state().currentPage > 1,
      from: (this.state().currentPage - 1) * this.state().itemsPerPage + 1,
      to: Math.min(this.state().currentPage * this.state().itemsPerPage, this.state().totalRecords)
    }).pages;
  }
}

