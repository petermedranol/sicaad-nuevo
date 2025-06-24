import { Injectable } from '@angular/core';
import { Subject, Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { SortOrder, TableState, TableFilters } from '../interfaces/table.interface';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private searchSubject = new Subject<string>();
  
  setupSearch(debounceMs: number = 500): Observable<string> {
    return this.searchSubject.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged()
    );
  }

  search(query: string): void {
    this.searchSubject.next(query);
  }

  toggleSort(currentField: string, newField: string, currentOrder: SortOrder): { field: string, order: SortOrder } {
    if (currentField === newField) {
      return {
        field: newField,
        order: currentOrder === 'ASC' ? 'DESC' : 'ASC'
      };
    }
    return {
      field: newField,
      order: 'ASC'
    };
  }

  createFilters(state: TableState): TableFilters {
    // Asegurarse de que sortField sea un string válido
    const sortField = state.sortField || 'name';  // valor por defecto si no hay campo de ordenamiento
    return {
      page: state.currentPage.toString(),
      limit: state.itemsPerPage.toString(),
      search: state.search,
      sortField,
      sortOrder: state.sortOrder
    };
  }

  calculatePages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  calculatePageRange(currentPage: number, totalPages: number, maxPages: number = 5): number[] {
    const pages: number[] = [];
    const halfWay = Math.floor(maxPages / 2);
    
    let start = Math.max(currentPage - halfWay, 1);
    let end = Math.min(start + maxPages - 1, totalPages);

    if (end - start + 1 < maxPages) {
      start = Math.max(end - maxPages + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  createInitialState(itemsPerPage: number = 10, defaultSortField: string = '', defaultSortOrder: SortOrder = 'ASC'): TableState {
    return {
      currentPage: 1,
      itemsPerPage,
      totalRecords: 0,
      totalPages: 0,
      sortField: defaultSortField || 'name',
      sortOrder: defaultSortOrder,
      search: '',
      loading: false
    };
  }
}
