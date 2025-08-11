import { DataTableConfig } from '@shared/components/data-table';
import { Edit, Trash2, Camera } from 'lucide-angular';
import { environment } from '@environments/environment';
import { User } from '../types/users.types';

/**
 * Configuración de la tabla de usuarios
 */
export function createUsersTableConfig(
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  onCapturePhoto: (user: User) => void
): DataTableConfig<User> {
  return {
    // URL del endpoint
    url: '/api/users',

    // Configuración de columnas
    columns: [
      {
        field: 'photo_path',
        header: 'Foto',
        template: 'image',
        sortable: false,
        width: '60px',
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
        width: '100px',
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
        onClick: onCapturePhoto
      },
      {
        label: 'Editar',
        icon: Edit,
        onClick: onEdit,
        primary: true
      },
      {
        label: 'Eliminar',
        icon: Trash2,
        onClick: onDelete
      }
    ]
  };
}
