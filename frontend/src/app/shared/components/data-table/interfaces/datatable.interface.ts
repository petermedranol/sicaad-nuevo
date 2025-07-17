export interface DataTableColumn<T = any> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  visible?: boolean;
  width?: string;
  template?: 'text' | 'image' | 'badge' | 'date' | 'actions' | 'custom';
  format?: (value: any, row?: T) => string;
  render?: (value: any, row: T) => string;
  class?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low'; // Nuevo: nivel de importancia para responsive
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: any; // Lucide icon
  onClick: (row: T) => void | Promise<void>;
  condition?: (row: T) => boolean;
  class?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  primary?: boolean; // Indica si es la acción principal (aparece destacada)
}

export interface DataTableConfig<T = any> {
  // Configuración de servidor
  url: string;
  method?: 'GET' | 'POST';

  // Configuración de columnas
  columns: DataTableColumn<T>[];

  // Acciones disponibles
  actions?: DataTableAction<T>[];

  // Configuración de búsqueda
  searchable?: boolean;
  searchPlaceholder?: string;

  // Configuración de paginación
  pagination?: boolean;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;

  // Configuración de ordenamiento
  defaultSort?: {
    field: keyof T | string;
    order: 'ASC' | 'DESC';
  };

  // Configuración de diseño
  showHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  responsive?: boolean;

  // Configuración de carga
  loadingMessage?: string;
  emptyMessage?: string;

  // Headers personalizados para las peticiones
  headers?: Record<string, string>;

  // Parámetros adicionales para las peticiones
  params?: Record<string, any>;

  // Transformación de datos
  transform?: (data: any) => {
    data: T[];
    pagination: {
      total_records: number;
      total_pages: number;
      current_page: number;
      per_page: number;
      has_next_page: boolean;
      has_previous_page: boolean;
      from: number;
      to: number;
    };
  };
}

export interface DataTableState {
  loading: boolean;
  data: any[];
  search: string;
  currentPage: number;
  itemsPerPage: number;
  totalRecords: number;
  totalPages: number;
  sortField: string;
  sortOrder: 'ASC' | 'DESC';
}

export interface DataTableResponse {
  success: boolean;
  data: {
    data?: any[];
    users?: any[]; // Para compatibilidad con endpoint actual
    pagination: {
      total_records: number;
      total_pages: number;
      current_page: number;
      per_page: number;
      has_next_page: boolean;
      has_previous_page: boolean;
      from: number;
      to: number;
    };
  };
  message?: string;
}
