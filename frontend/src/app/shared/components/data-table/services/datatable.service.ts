import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DataTableConfig, DataTableResponse, DataTableState } from '../interfaces/datatable.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataTableService {
  private readonly http = inject(HttpClient);

  /**
   * Crea el estado inicial del DataTable
   */  createInitialState(config: DataTableConfig): DataTableState {
    const initialState = {
      loading: false,
      data: [],
      search: '',
      currentPage: 1,
      itemsPerPage: config.defaultItemsPerPage || config.itemsPerPageOptions?.[0] || 10,
      totalRecords: 0,
      totalPages: 0,
      sortField: config.defaultSort?.field as string || '',
      sortOrder: config.defaultSort?.order || 'ASC'
    };


    return initialState;
  }

  /**
   * Carga datos desde el servidor
   */
  async loadData<T>(config: DataTableConfig<T>, state: DataTableState): Promise<DataTableResponse> {
    const url = this.buildUrl(config, state);
    const params = this.buildParams(config, state);

    try {
      const response = await this.http.get<any>(url, {
        params,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...config.headers
        },
        withCredentials: true // Importante para enviar cookies de sesión/CSRF
      }).toPromise();

      // Si hay transformación personalizada, aplicarla
      if (config.transform) {
        const transformed = config.transform(response);
        return {
          success: true,
          data: {
            data: transformed.data,
            pagination: transformed.pagination
          }
        };
      }

      // Verificar estructura de respuesta estándar
      if (response?.success && response?.data) {
        return response;
      }

      throw new Error('Formato de respuesta inválido');
    } catch (error: any) {
      throw new Error(error?.message || 'Error al cargar datos');
    }
  }

  /**
   * Construye la URL completa
   */
  private buildUrl(config: DataTableConfig, state: DataTableState): string {
    const baseUrl = config.url.startsWith('http')
      ? config.url
      : `${environment.apiUrl}${config.url}`;

    return baseUrl;
  }

  /**
   * Construye los parámetros de la petición
   */
  private buildParams<T>(config: DataTableConfig<T>, state: DataTableState): HttpParams {
    let params = new HttpParams()
      .set('page', state.currentPage.toString())
      .set('limit', state.itemsPerPage.toString());

    if (state.search.trim()) {
      params = params.set('search', state.search.trim());
    }

    if (state.sortField) {
      params = params.set('sortField', state.sortField);
      params = params.set('sortOrder', state.sortOrder);
    }

    // Agregar parámetros adicionales del config
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }

    return params;
  }

  /**
   * Calcula el rango de páginas para la paginación
   */
  calculatePageRange(currentPage: number, totalPages: number, maxVisible: number = 5) {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return {
      pages,
      showFirstEllipsis: startPage > 1,
      showLastEllipsis: endPage < totalPages,
      hasFirst: startPage > 1,
      hasLast: endPage < totalPages
    };
  }
}
