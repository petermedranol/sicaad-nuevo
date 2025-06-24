import { Component, OnInit, signal, inject } from '@angular/core';
import { TopbarService } from '../../services/topbar.service';
import { ThemeService } from '../../shared/services/theme.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  formatted_date: string;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_records: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  from: number;
  to: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: PaginationInfo;
    filters: {
      search: string;
      sort_field: string;
      sort_order: string;
    };
  };
  message: string;
}

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
export class UsersComponent implements OnInit {
  // Servicios
  private http = inject(HttpClient);
  private topbarService = inject(TopbarService);
  themeService = inject(ThemeService);
  private readonly apiUrl = 'http://localhost/api';

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
      const params = {
        page: this.pagination().current_page.toString(),
        limit: this.itemsPerPage.toString(),
        search: this.searchQuery,
        sortField: this.sortField,
        sortOrder: this.sortOrder
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await this.http.get<ApiResponse>(
        `${this.apiUrl}/users?${queryString}`,
        { withCredentials: true }
      ).toPromise();

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
   * Elimina un usuario (placeholder)
   */
  async deleteUser(user: User) {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.name}?`)) {
      // TODO: Implementar eliminación real
      console.log('Eliminando usuario:', user.id);
      // Recargar después de eliminar
      // await this.loadUsers();
    }
  }

  /**
   * Edita un usuario
   */
  async editUser(user: User) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Usuario',
      html: `
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
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Usuario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      width: window.innerWidth <= 768 ? '100%' : '44rem',
      padding: 0,
      customClass: {
        popup: 'user-edit-popup'
      },
      preConfirm: () => {
        const name = (document.getElementById('swal-edit-name') as HTMLInputElement)?.value;
        const email = (document.getElementById('swal-edit-email') as HTMLInputElement)?.value;
        const password = (document.getElementById('swal-edit-password') as HTMLInputElement)?.value;
        const passwordConfirm = (document.getElementById('swal-edit-password-confirm') as HTMLInputElement)?.value;

        // Validaciones
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

        // Validar contraseña solo si se proporcionó
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

        // Detectar cambios comparando con datos originales
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const hasPasswordChange = password && password.length > 0;

        // Verificar si hay cambios reales
        const hasNameChange = trimmedName !== user.name;
        const hasEmailChange = trimmedEmail !== user.email;
        const hasAnyChange = hasNameChange || hasEmailChange || hasPasswordChange;

        if (!hasAnyChange) {
          Swal.showValidationMessage('No se han detectado cambios para actualizar');
          return false;
        }

        const updateData: any = {
          name: trimmedName,
          email: trimmedEmail
        };

        // Solo incluir contraseña si se proporcionó
        if (hasPasswordChange) {
          updateData.password = password;
          updateData.password_confirmation = passwordConfirm;
        }

        return updateData;
      }
    });

    if (formValues) {
      await this.submitEditUser(user.id, formValues);
    }
  }

  /**
   * Crea un nuevo usuario (formulario igual al de editar)
   */
  async createUser() {
    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Usuario',
      html: `
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
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Usuario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      width: window.innerWidth <= 768 ? '100%' : '44rem',
      padding: 0,
      preConfirm: () => {
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
        return { name, email, password, password_confirmation: passwordConfirm };
      }
    });

    if (formValues) {
      try {
        Swal.fire({
          title: 'Creando usuario...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        const response: any = await this.http.post(
          `${this.apiUrl}/users`,
          formValues,
          { withCredentials: true }
        ).toPromise();
        if (response?.success) {
          await Swal.fire({
            icon: 'success',
            title: '¡Usuario creado!',
            text: `Usuario ${formValues.name} creado exitosamente`,
            confirmButtonColor: '#667eea'
          });
          this.loadUsers();
        } else {
          throw new Error(response?.message || 'Error desconocido');
        }
      } catch (error: any) {
        let errorMessage = 'Error interno del servidor';
        if (error.error?.errors) {
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
          title: 'Error al crear usuario',
          text: errorMessage,
          confirmButtonColor: '#667eea'
        });
      }
    }
  }

  /**
   * Envía los datos de actualización del usuario al servidor
   */
  private async submitEditUser(userId: number, userData: any) {
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
      const response = await this.http.put<any>(
        `${this.apiUrl}/users/${userId}`,
        userData,
        { withCredentials: true }
      ).toPromise();

      if (response?.success) {
        // Éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Usuario actualizado!',
          text: `Usuario ${userData.name} actualizado exitosamente`,
          confirmButtonColor: '#667eea'
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

