import { TableConfig } from '../../../../shared/interfaces/table.interface';
import { User } from '../../../../auth/interfaces/user.interface';

export const USER_TABLE_CONFIG: TableConfig<User> = {
  columns: [
    { 
      field: 'photo_path',
      header: 'Foto',
      sortable: false,
      visible: true
    },
    { 
      field: 'id',
      header: '#',
      sortable: true,
      visible: true
    },
    {
      field: 'name' as keyof User,
      header: 'Nombre',
      sortable: true,
      visible: true
    },
    {
      field: 'email' as keyof User,
      header: 'Email',
      sortable: true,
      visible: false
    },
    {
      field: 'created_at' as keyof User,
      header: 'Fecha Registro',
      sortable: true,
      visible: false,
      format: (value: string) => new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  ],
  defaultSort: {
    field: 'id',
    order: 'DESC'
  },
  itemsPerPageOptions: [10, 25, 50]
};
