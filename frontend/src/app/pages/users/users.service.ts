import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../auth/interfaces/user.interface';
import { UserCreateFormData, UserUpdateFormData } from './interfaces/user-form.interface';

import { PaginationInfo } from '../../shared/services/pagination.service';

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

  async createUser(userData: UserCreateFormData) {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/users`,
      userData,
      { withCredentials: true }
    ).toPromise();
  }

  async updateUser(userId: number, userData: UserUpdateFormData) {
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
