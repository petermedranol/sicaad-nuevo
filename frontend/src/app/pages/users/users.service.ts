import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/interfaces/user.interface';

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_records: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  from: number;
  to: number;
}

export interface ApiResponse {
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

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UserUpdateData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/api';

  async getUsers(params: {
    page: string;
    limit: string;
    search: string;
    sortField: string;
    sortOrder: string;
  }) {
    const queryString = new URLSearchParams(params).toString();
    return this.http.get<ApiResponse>(
      `${this.apiUrl}/users?${queryString}`,
      { withCredentials: true }
    ).toPromise();
  }

  async createUser(userData: UserCreateData) {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/users`,
      userData,
      { withCredentials: true }
    ).toPromise();
  }

  async updateUser(userId: number, userData: UserUpdateData) {
    return this.http.put<ApiResponse>(
      `${this.apiUrl}/users/${userId}`,
      userData,
      { withCredentials: true }
    ).toPromise();
  }

  async deleteUser(userId: number) {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/users/${userId}`,
      { withCredentials: true }
    ).toPromise();
  }
}
