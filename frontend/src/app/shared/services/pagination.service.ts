import { Injectable } from '@angular/core';

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

export interface PageRange {
  pages: number[];
  showStartEllipsis: boolean;
  showEndEllipsis: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  /**
   * Calcula el rango de páginas a mostrar con ellipsis
   */
  calculatePageRange(pagination: PaginationInfo, maxVisiblePages = 5): PageRange {
    const totalPages = pagination.total_pages;
    const currentPage = pagination.current_page;
    
    if (totalPages <= maxVisiblePages) {
      return {
        pages: Array.from({ length: totalPages }, (_, i) => i + 1),
        showStartEllipsis: false,
        showEndEllipsis: false
      };
    }

    const sidePages = Math.floor((maxVisiblePages - 1) / 2);
    let startPage = Math.max(currentPage - sidePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    const pages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    return {
      pages,
      showStartEllipsis: startPage > 1,
      showEndEllipsis: endPage < totalPages
    };
  }

  /**
   * Verifica si una página es válida
   */
  isValidPage(page: number, totalPages: number): boolean {
    return page >= 1 && page <= totalPages;
  }

  /**
   * Obtiene texto descriptivo de la paginación actual
   */
  getPaginationDescription(pagination: PaginationInfo): string {
    return `Mostrando ${pagination.from} a ${pagination.to} de ${pagination.total_records} registros`;
  }
}
