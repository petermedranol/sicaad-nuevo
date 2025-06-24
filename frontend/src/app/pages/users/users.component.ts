import { Component, OnInit, signal, inject, LOCALE_ID } from '@angular/core';
import { TopbarService } from '../../services/topbar.service';
import { ThemeService } from '../../shared/services/theme.service';
import { CommonModule, DatePipe } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { NotificationService } from '../../shared/services/notification.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { UsersFormService } from './services/users-form.service';
import { UserFormData, UserState, UserFilters } from './interfaces/user-form.interface';

registerLocaleData(localeEs);
import { FormsModule } from '@angular/forms';
import { LucideAngularModule,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  Users
} from 'lucide-angular';
import Swal from 'sweetalert2';

import { User } from '../../auth/interfaces/user.interface';
import { UserFormData } from './interfaces';
import { UsersService, PaginationInfo } from './users.service';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DatePipe
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' }
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  // Servicios
  private readonly usersService = inject(UsersService);
  private readonly usersFormService = inject(UsersFormService);
  private readonly topbarService = inject(TopbarService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly notification = inject(NotificationService);
  private readonly paginationService = inject(PaginationService);
  readonly themeService = inject(ThemeService);

  // Estado
  readonly state = signal<UserState>({
    users: [],
    pagination: {
      current_page: 1,
      per_page: 10,
      total_records: 0,
      total_pages: 0,
      has_next_page: false,
      has_previous_page: false,
      from: 0,
      to: 0
    },
    filters: {
      page: '1',
      limit: '10',
      search: '',
      sortField: 'name',
      sortOrder: 'ASC'
    },
    isLoading: false
  });

  // Iconos
  readonly searchIcon = Search;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly resetIcon = RotateCcw;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly plusIcon = Plus;
  readonly sortAscIcon = ArrowUp;
  readonly sortDescIcon = ArrowDown;
  readonly usersIcon = Users;

  // Estados
  isLoading = signal(false);
  users = signal<User[]>([]);
  pagination = signal<PaginationInfo>({
    current_page: 1,
    per_page: 10,
    total_records: 0,
    total_pages: 0,
    has_next_page: false,
    has_previous_page: false,
    from: 0,
    to: 0
  });

  // Filtros y búsqueda
  searchQuery = '';
  itemsPerPage = 10;
  sortField = 'name';
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  // Debounce para búsqueda
  private searchTimeout: any = null;

  ngOnInit() {
    this.loadUsers();
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
  }

  /**
   * Carga usuarios desde el servidor con paginación y filtros
   */
  async loadUsers() {
    this.isLoading.set(true);

    try {
      const response = await this.usersService.getUsers({
        page: this.pagination().current_page.toString(),
        limit: this.itemsPerPage.toString(),
        search: this.searchQuery,
        sortField: this.sortField,
        sortOrder: this.sortOrder
      });

      if (response?.success) {
        this.users.set(response.data.users);
        this.pagination.set(response.data.pagination);

      } else {
        console.error('❌ Error en respuesta:', response?.message);
      }

    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Maneja eventos de input en el campo de búsqueda
   */
  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.onSearchChange(target.value);
  }

  /**
   * Maneja cambios en la búsqueda con debounce
   */
  onSearchChange(query: string) {
    // Limpiar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Configurar nuevo timeout
    this.searchTimeout = setTimeout(() => {
      this.searchQuery = query;
      this.pagination.update(p => ({ ...p, current_page: 1 })); // Reset a página 1
      this.loadUsers();
    }, 500); // 500ms de debounce
  }

  /**
   * Maneja cambios en el select de elementos por página
   */
  onItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value);
    this.changeItemsPerPage(newLimit);
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch() {
    this.searchQuery = '';
    this.pagination.update(p => ({ ...p, current_page: 1 }));
    this.loadUsers();
  }

  /**
   * Cambia el número de elementos por página
   */
  changeItemsPerPage(newLimit: number) {
    this.itemsPerPage = newLimit;
    this.pagination.update(p => ({ ...p, current_page: 1, per_page: newLimit }));
    this.loadUsers();
  }

  /**
   * Navega a una página específica
   */
  goToPage(page: number) {
    const currentPagination = this.pagination();
    if (page >= 1 && page <= currentPagination.total_pages) {
      this.pagination.update(p => ({ ...p, current_page: page }));
      this.loadUsers();
    }
  }

  /**
   * Ordena por campo específico
   */
  sortBy(field: string) {
    // Si es el mismo campo, cambiar orden
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      // Nuevo campo, empezar con ASC
      this.sortField = field;
      this.sortOrder = 'ASC';
    }

    this.pagination.update(p => ({ ...p, current_page: 1 }));
    this.loadUsers();
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.notification.showConfirmation({
      title: '¿Eliminar usuario?',
      message: `¿Está seguro de eliminar al usuario "${user.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await this.notification.showLoading('Eliminando usuario...');
        const response = await this.usersService.deleteUser(user.id);

        if (response?.success) {
          await this.notification.showSuccess('Usuario eliminado');
          await this.loadUsers();
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        await this.errorHandler.handleApiError(error, 'Error al eliminar usuario');
      }
    }
  }

  /**
   * Edita un usuario
   */
  async editUser(user: User): Promise<void> {
    const formData = await this.usersFormService.showEditForm(user);
    if (formData) {
      try {
        await this.notification.showLoading('Actualizando usuario...');
        const response = await this.usersService.updateUser(user.id, formData);

        if (response?.success) {
          await this.notification.showSuccess('¡Usuario actualizado!');
          await this.loadUsers();
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        await this.errorHandler.handleApiError(error, 'Error al actualizar usuario');
      }
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(): Promise<void> {
    const formData = await this.usersFormService.showCreateForm();
    if (formData) {
      try {
        await this.notification.showLoading('Creando usuario...');
        const response = await this.usersService.createUser(formData);

        if (response?.success) {
          await this.notification.showSuccess('¡Usuario creado!');
          await this.loadUsers();
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error) {
        await this.errorHandler.handleApiError(error, 'Error al crear usuario');
      }
    }
  }
    try {
      // Mostrar loading
      Swal.fire({
        title: 'Actualizando usuario...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Enviar petición al servidor
      const response = await this.usersService.updateUser(userId, userData);

      if (response?.success) {
        // Éxito
        await Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: '¡Usuario actualizado!',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          background: '#22c55e', // Verde (Tailwind: green-500)
          color: '#fff',         // Texto blanco
          customClass: {
            popup: 'swal2-toast'
          }
        });

        // Recargar la tabla
        await this.loadUsers();

      } else {
        throw new Error(response?.message || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('❌ Error actualizando usuario:', error);

      // Extraer mensajes de error del backend
      let errorMessage = 'Error interno del servidor';

      if (error.error?.errors) {
        // Errores de validación del backend
        const errors = error.error.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join('\n');
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar usuario',
        text: errorMessage,
        confirmButtonColor: '#667eea'
      });
    }
  }

  /**
   * Generar números de página para mostrar
   */
  get pageNumbers(): number[] {
    const maxPagesToShow = 5;
    const totalPages = this.pagination().total_pages;
    const currentPage = this.pagination().current_page;
    const pages: number[] = [];

    // Calcular rango de páginas a mostrar
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}

