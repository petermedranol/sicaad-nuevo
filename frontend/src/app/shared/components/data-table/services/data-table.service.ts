import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { DataTableResponse, DataTableFilters } from '../interfaces/data-table.interface';
import { SortOrder } from '../../../interfaces/table.interface';

/**
 * Servicio genérico para DataTable
 * Maneja las peticiones HTTP para obtener datos del servidor
 */
@Injectable({
  providedIn: 'root'
})
export class DataTableService {
  private http = inject(HttpClient);

  /**
   * Obtiene datos del servidor
   * @param url URL del endpoint
   * @param filters Filtros para la petición
   * @returns Promise con la respuesta del servidor
   */
  async getData<T>(url: string, filters: DataTableFilters): Promise<DataTableResponse<T>> {
    try {
      // Construir parámetros HTTP
      let params = new HttpParams();

      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });

      // Realizar petición
      const response = await firstValueFrom(
        this.http.get<DataTableResponse<T>>(url, { params })
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Construye los filtros desde el estado de la tabla
   * @param currentPage Página actual
   * @param itemsPerPage Elementos por página
   * @param search Término de búsqueda
   * @param sortField Campo de ordenamiento
   * @param sortOrder Orden de ordenamiento
   * @param additionalFilters Filtros adicionales
   * @returns Objeto con filtros
   */
  buildFilters(
    currentPage: number,
    itemsPerPage: number,
    search: string = '',
    sortField: string = '',
    sortOrder: SortOrder = 'ASC',
    additionalFilters: Record<string, any> = {}
  ): DataTableFilters {
    return {
      page: currentPage,
      limit: itemsPerPage,
      search: search.trim(),
      sortField,
      sortOrder,
      ...additionalFilters
    };
  }

  /**
   * Valida la respuesta del servidor
   * @param response Respuesta del servidor
   * @returns true si la respuesta es válida
   */
  validateResponse<T>(response: DataTableResponse<T>): boolean {
    return !!(
      response &&
      typeof response.success === 'boolean' &&
      response.data &&
      Array.isArray(response.data.items) &&
      response.data.pagination &&
      typeof response.data.pagination.total_records === 'number'
    );
  }
}
