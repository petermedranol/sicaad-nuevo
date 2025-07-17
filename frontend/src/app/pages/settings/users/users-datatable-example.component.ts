import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Edit, Trash2, Camera, Plus } from 'lucide-angular';

import { DataTableComponent, DataTableConfig } from '../../../shared/components/data-table';
import { TopbarService } from '../../../shared/services/topbar.service';
import { PageTitleService } from '../../../shared/services/page-title.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { User } from '../../../auth/interfaces/user.interface';
import { environment } from '../../../../environments/environment';

/**
 * Ejemplo de uso del DataTable genérico para usuarios
 * Muestra cómo usar el componente de forma simple y declarativa
 */
@Component({
  selector: 'app-users-datatable-example',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DataTableComponent],
  template: `
    <div class="container mx-auto p-6">
      <!-- DataTable con toda la funcionalidad integrada -->
      <app-data-table
        [config]="tableConfig"
        (dataLoaded)="onDataLoaded($event)"
        (error)="onError($event)">
      </app-data-table>
    </div>
  `
})
export class UsersDataTableExampleComponent implements OnInit {
  private readonly topbarService = inject(TopbarService);
  private readonly pageTitle = inject(PageTitleService);
  private readonly notification = inject(NotificationService);

  // Configuración completa del DataTable
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
        width: '80px',
        format: (value) => value ? `${environment.apiUrl}/storage/${value}` : '/no-image.png'
      },
      {
        field: 'id',
        header: '#',
        sortable: true,
        width: '80px'
      },
      {
        field: 'name',
        header: 'Nombre',
        sortable: true,
        searchable: true
      },
      {
        field: 'email',
        header: 'Email',
        sortable: true,
        searchable: true,
        visible: true // Ahora visible por defecto
      },
      {
        field: 'created_at',
        header: 'Fecha Registro',
        template: 'date',
        sortable: true,
        visible: true,
        format: (value: string) => new Date(value).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    ],

    // Acciones disponibles
    actions: [
      {
        label: 'Capturar Foto',
        icon: Camera,
        onClick: (user: User) => this.capturePhoto(user),
        variant: 'secondary'
      },
      {
        label: 'Editar',
        icon: Edit,
        onClick: (user: User) => this.editUser(user),
        variant: 'primary'
      },
      {
        label: 'Eliminar',
        icon: Trash2,
        onClick: (user: User) => this.deleteUser(user),
        variant: 'danger'
      }
    ],

    // Configuración de búsqueda
    searchable: true,
    searchPlaceholder: 'Buscar usuarios...',

    // Configuración de paginación
    pagination: true,
    itemsPerPageOptions: [5, 10, 25, 50],
    defaultItemsPerPage: 5,

    // Configuración de ordenamiento
    defaultSort: {
      field: 'id',
      order: 'DESC'
    },

    // Configuración de diseño
    showHeader: true,
    striped: true,
    hoverable: true,
    responsive: true,

    // Mensajes personalizados
    loadingMessage: 'Cargando usuarios...',
    emptyMessage: 'No se encontraron usuarios',

    // Transformación de datos (opcional)
    transform: (response: any) => ({
      data: response.data?.users || response.data?.data || [],
      pagination: response.data?.pagination || {
        total_records: 0,
        total_pages: 0,
        current_page: 1,
        per_page: 10,
        has_next_page: false,
        has_previous_page: false,
        from: 0,
        to: 0
      }
    })
  };

  ngOnInit() {
    // Configurar topbar
    this.topbarService.updateTopbar({
      title: 'Usuarios (DataTable)',
      description: 'Gestión de usuarios con componente genérico',
      buttons: [
        {
          label: 'Nuevo Usuario',
          icon: Plus,
          onClick: () => this.createUser(),
          variant: 'secondary'
        }
      ]
    });

    this.pageTitle.setTitle('Usuarios - DataTable');
  }

  onDataLoaded(users: User[]) {
  }

  onError(error: string) {
  }

  async capturePhoto(user: User) {
    // Aquí iría la lógica de captura de foto
  }

  async editUser(user: User) {
    // Aquí iría la lógica de edición
  }

  async deleteUser(user: User) {
    const confirmed = await this.notification.showConfirmation({
      title: '¿Eliminar usuario?',
      message: `¿Está seguro de eliminar al usuario "${user.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      await this.notification.showSuccess('Usuario eliminado correctamente');
      // Aquí iría la llamada al API y refresh de datos
    }
  }

  async createUser() {
    // Aquí iría la lógica de creación
  }
}
