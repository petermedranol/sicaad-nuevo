export type SortOrder = 'ASC' | 'DESC';

export interface TableColumn<T> {
  field: keyof T;
  header: string;
  sortable: boolean;
  visible: boolean;
  format?: (value: any) => string;
}

export interface TableConfig<T> {
  columns: TableColumn<T>[];
  defaultSort: {
    field: keyof T;
    order: SortOrder;
  };
  itemsPerPageOptions: number[];
}

export interface TableState {
  currentPage: number;
  itemsPerPage: number;
  totalRecords: number;
  totalPages: number;
  sortField: string;
  sortOrder: SortOrder;
  search: string;
  loading: boolean;
}

export interface TableFilters {
  page: string;
  limit: string;
  search: string;
  sortField: string;
  sortOrder: string;
}
