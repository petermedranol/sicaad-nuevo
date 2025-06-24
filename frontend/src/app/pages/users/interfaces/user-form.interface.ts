export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface UserFilters {
  page: string;
  limit: string;
  search: string;
  sortField: string;
  sortOrder: string;
}

export interface UserState {
  users: User[];
  pagination: PaginationInfo;
  filters: UserFilters;
  isLoading: boolean;
}
