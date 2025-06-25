import { Component, inject, effect, OnInit } from '@angular/core';
import { TopbarService } from '../../services/topbar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotoCaptureComponent } from '../../shared/components/photo-capture/photo-capture.component';
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
  Camera
} from 'lucide-angular';
import Swal from 'sweetalert2';

import { User } from '../../auth/interfaces/user.interface';
import {
  ErrorHandlerService,
  NotificationService,
  PageTitleService,
  BaseTableComponent
} from '../../shared';
import { PaginationService } from '../../shared/services/pagination.service';
import { ImageProcessorService } from '../../shared/services/image-processor.service';

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
    LucideAngularModule,
    PhotoCaptureComponent
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent extends BaseTableComponent<User> implements OnInit {
  // === Servicios ===
  private readonly usersService = inject(UsersService);
  private readonly usersFormService = inject(UsersFormService);
  private readonly topbarService = inject(TopbarService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly notification = inject(NotificationService);
  private readonly pageTitle = inject(PageTitleService);
  private readonly paginationService = inject(PaginationService);
  private readonly imageProcessor = inject(ImageProcessorService);

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

  // === Configuración de tabla ===
  override config = USER_TABLE_CONFIG;

  constructor() {
    super();
    this.state.update(state => ({
      ...state,
      sortField: this.config.defaultSort.field as string,
      sortOrder: this.config.defaultSort.order
    }));
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

    const result = await Swal.fire({
      title: 'Foto de Usuario',
      html: `
        <div class="space-y-4">
          <div class="flex justify-center space-x-4">
            <button type="button" class="btn btn-primary" id="webcam-btn">
              <i class="fas fa-camera"></i>
              Tomar Foto
            </button>
            <label class="btn btn-secondary">
              <i class="fas fa-upload"></i>
              Subir Imagen
              <input type="file" accept="image/*" class="hidden" id="file-input">
            </label>
          </div>
          <div id="preview-container" class="hidden">
            <img id="preview-image" class="max-w-[350px] mx-auto rounded-lg shadow-lg" alt="Vista previa">
          </div>
          <video id="webcam-video" class="hidden max-w-[350px] mx-auto rounded-lg shadow-lg"></video>
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: true,
      showDenyButton: false,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      width: 'auto',
      didOpen: async (modalElement) => {
        const confirmButton = Swal.getConfirmButton();
        if (confirmButton) confirmButton.classList.add('hidden');
        const webcamBtn = Swal.getPopup()?.querySelector('#webcam-btn') as HTMLButtonElement;
        const fileInput = Swal.getPopup()?.querySelector('#file-input') as HTMLInputElement;
        const previewContainer = Swal.getPopup()?.querySelector('#preview-container') as HTMLDivElement;
        const previewImage = Swal.getPopup()?.querySelector('#preview-image') as HTMLImageElement;
        const video = Swal.getPopup()?.querySelector('#webcam-video') as HTMLVideoElement;
        
        let stream: MediaStream | null = null;

        // Función para procesar la imagen
        const processImage = async (imageData: string | File) => {
          try {
            const resizedImage = await this.imageProcessor.resizeImage(imageData);
            previewImage.src = resizedImage;
            previewContainer.classList.remove('hidden');
            if (video) video.classList.add('hidden');
            Swal.enableButtons();
            Swal.getConfirmButton()?.classList.remove('hidden');
            return resizedImage;
          } catch (error) {
            console.error('Error processing image:', error);
            await this.notification.showError('Error', 'Error al procesar la imagen');
            return null;
          }
        };

        // Manejador para subida de archivo
        fileInput.addEventListener('change', async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files?.length) {
            await processImage(files[0]);
          }
        });

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
              video.classList.remove('hidden');
              previewContainer.classList.add('hidden');
              webcamBtn.textContent = 'Capturar';
              await video.play();
            } else {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              canvas.getContext('2d')?.drawImage(video, 0, 0);
              const photoData = canvas.toDataURL('image/jpeg', 0.8);
              await processImage(photoData);
              stream.getTracks().forEach(track => track.stop());
              stream = null;
              webcamBtn.textContent = 'Tomar Foto';
            }
          } catch (error) {
            console.error('Error with webcam:', error);
            await this.notification.showError('Error', 'Error al acceder a la cámara');
          }
        });

        // Limpiar al cerrar
        Swal.getPopup()?.addEventListener('close', () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        });
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
    const formData = await this.usersFormService.showEditForm(user);
    if (formData !== null) {
      try {
        const response = await this.usersService.updateUser(user.id, formData);
        if (response?.success) {
          await this.loadData();
          await this.notification.showSuccess('¡Usuario actualizado!');
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        await this.errorHandler.handleApiError(error, 'Error al actualizar usuario');
      }
    }
  }

  /**
   * Crea un nuevo usuario.
   */
  async createUser(): Promise<void> {
    const formData = await this.usersFormService.showCreateForm();
    if (formData !== null) {
      try {
        const response = await this.usersService.createUser(formData);
        if (response?.success) {
          await this.loadData();
          await this.notification.showSuccess('¡Usuario creado!');
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        await this.errorHandler.handleApiError(error, 'Error al crear usuario');
      }
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

