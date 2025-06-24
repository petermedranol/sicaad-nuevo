import { Component, inject } from '@angular/core';
import { TopbarService } from '../../services/topbar.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { NotificationService } from '../../shared/services/notification.service';
import { UsersFormService } from './services/users-form.service';
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
import { UsersService } from './users.service';
import { USER_TABLE_CONFIG } from './config/users-table.config';
import { BaseTableComponent } from '../../shared/components/base-table/base-table.component';
import { PageTitleService } from '../../shared/services/page-title.service';

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
    DatePipe
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent extends BaseTableComponent<User> {
  // === Servicios ===
  private readonly usersService = inject(UsersService);
  private readonly usersFormService = inject(UsersFormService);
  private readonly topbarService = inject(TopbarService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly notification = inject(NotificationService);
  private readonly pageTitle = inject(PageTitleService);

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
  readonly usersIcon = Users;

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
    this.pageTitle.setTitle('Módulo de usuarios');
  }

  /**
   * Carga usuarios desde el servidor con paginación y filtros.
   */
  override async loadData(): Promise<void> {
    this.setLoading(true);
    try {
      const filters = this.tableService.createFilters(this.state());
      const response = await this.usersService.getUsers(filters);

      if (response?.success) {
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
  async deleteUser(user: User): Promise<void> {
    Swal.close();
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
    Swal.close();
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
    Swal.close();
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
   * Genera los números de página para la paginación.
   */
  override get pageNumbers(): number[] {
    return this.tableService.calculatePageRange(
      this.state().currentPage,
      this.state().totalPages
    );
  }
}

