import { Type } from '@angular/core';
import { LucideIcons } from 'lucide-angular';
import { TableConfig, SortOrder } from '../../../interfaces/table.interface';

/**
 * Configuración de acción en la tabla
 */
export interface DataTableAction<T> {
  /** Etiqueta de la acción */
  label: string;
  /** Icono de la acción */
  icon: LucideIcons;
  /** Función que se ejecuta al hacer clic */
  onClick: (item: T) => void | Promise<void>;
  /** Clase CSS para el botón */
  cssClass?: string;
  /** Mostrar condicionalmente la acción */
  showIf?: (item: T) => boolean;
  /** Tooltip para la acción */
  tooltip?: string;
}

/**
 * Configuración de columna personalizada para DataTable
 */
export interface DataTableColumn<T> {
  /** Campo del objeto */
  field: keyof T;
  /** Encabezado de la columna */
  header: string;
  /** Es ordenable */
  sortable: boolean;
  /** Es visible */
  visible: boolean;
  /** Función de formato personalizada */
  format?: (value: any, item: T) => string;
  /** Template personalizado para la celda */
  cellTemplate?: Type<any>;
  /** Clase CSS para la celda */
  cellClass?: string | ((value: any, item: T) => string);
  /** Ancho de la columna */
  width?: string;
}

/**
 * Configuración del DataTable
 */
export interface DataTableConfig<T> {
  /** Configuración de columnas */
  columns: DataTableColumn<T>[];
  /** Ordenamiento por defecto */
  defaultSort: {
    field: keyof T;
    order: SortOrder;
  };
  /** Opciones de elementos por página */
  itemsPerPageOptions: number[];
  /** URL del endpoint para datos */
  apiUrl: string;
  /** Acciones disponibles en cada fila */
  actions?: DataTableAction<T>[];
  /** Mostrar buscador */
  showSearch?: boolean;
  /** Mostrar selector de elementos por página */
  showItemsPerPage?: boolean;
  /** Mostrar paginación */
  showPagination?: boolean;
  /** Placeholder del buscador */
  searchPlaceholder?: string;
  /** Título de la tabla */
  title?: string;
  /** Descripción de la tabla */
  description?: string;
  /** Botones de la barra superior */
  headerButtons?: DataTableHeaderButton[];
  /** Configuración de estados vacíos */
  emptyState?: {
    title: string;
    message: string;
    icon?: LucideIcons;
  };
  /** Configuración de estado de carga */
  loadingState?: {
    message: string;
  };
}

/**
 * Botón de la barra superior
 */
export interface DataTableHeaderButton {
  /** Etiqueta del botón */
  label: string;
  /** Icono del botón */
  icon: LucideIcons;
  /** Función que se ejecuta al hacer clic */
  onClick: () => void | Promise<void>;
  /** Variante del botón */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Mostrar condicionalmente el botón */
  showIf?: () => boolean;
}

/**
 * Respuesta esperada del servidor
 */
export interface DataTableResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current_page: number;
      per_page: number;
      total_records: number;
      total_pages: number;
      has_next_page: boolean;
      has_previous_page: boolean;
      from: number;
      to: number;
    };
  };
  message?: string;
}

/**
 * Filtros para la petición al servidor
 */
export interface DataTableFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: SortOrder;
  [key: string]: any; // Para filtros adicionales
}
