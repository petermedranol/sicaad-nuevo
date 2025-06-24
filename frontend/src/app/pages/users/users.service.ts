import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
  }): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return firstValueFrom(
      this.http.get<ApiResponse>(
        `${this.apiUrl}/users?${queryString}`,
        { withCredentials: true }
      )
    );
  }

  async createUser(userData: UserCreateFormData): Promise<ApiResponse> {
    return firstValueFrom(
      this.http.post<ApiResponse>(
        `${this.apiUrl}/users`,
        userData,
        { withCredentials: true }
      )
    );
  }

  async updateUser(userId: number, userData: UserUpdateFormData): Promise<ApiResponse> {
    return firstValueFrom(
      this.http.put<ApiResponse>(
        `${this.apiUrl}/users/${userId}`,
        userData,
        { withCredentials: true }
      )
    );
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    return firstValueFrom(
      this.http.delete<ApiResponse>(
        `${this.apiUrl}/users/${userId}`,
        { withCredentials: true }
      )
    );
  }
}
