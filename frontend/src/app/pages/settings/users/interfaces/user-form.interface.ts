import { User } from '../../../../auth/interfaces/user.interface';
import { PaginationInfo } from '../../../../shared/services/pagination.service';

export interface UserFormBase {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface UserCreateFormData extends UserFormBase {
  password: string;
  password_confirmation: string;
}

export interface UserUpdateFormData extends UserFormBase {
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
