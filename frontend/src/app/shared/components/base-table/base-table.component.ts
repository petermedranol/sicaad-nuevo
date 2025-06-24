import { Directive, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableService } from '../../services/table.service';
import { TableState, TableConfig, SortOrder } from '../../interfaces/table.interface';

@Directive()
export abstract class BaseTableComponent<T> implements OnInit, OnDestroy {
  protected tableService = inject(TableService);
  protected searchSubscription?: Subscription;

  // Estado de la tabla
  public state = signal<TableState>(this.tableService.createInitialState());
  
  // Datos de la tabla
  public data = signal<T[]>([]);
  
  // Configuración abstracta que debe ser proporcionada por las clases hijas
  abstract config: TableConfig<T>;
  
  // Método abstracto para cargar datos
  abstract loadData(): Promise<void>;

  ngOnInit() {
    this.setupSearch();
    this.loadData();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  protected setupSearch() {
    this.searchSubscription = this.tableService
      .setupSearch()
      .subscribe(async query => {
        this.state.update(state => ({
          ...state,
          search: query,
          currentPage: 1
        }));
        await this.loadData();
      });
  }

  onSearch(query: string) {
    this.tableService.search(query);
  }

  async onSort(field: keyof T) {
    const column = this.config.columns.find(col => col.field === field);
    if (column?.sortable) {
      const { field: newField, order } = this.tableService.toggleSort(
        this.state().sortField,
        field as string,
        this.state().sortOrder
      );

      this.state.update(state => ({
        ...state,
        sortField: newField,
        sortOrder: order,
        currentPage: 1
      }));

      await this.loadData();
    }
  }

  async onPageChange(page: number) {
    if (page >= 1 && page <= this.state().totalPages) {
      this.state.update(state => ({
        ...state,
        currentPage: page
      }));
      await this.loadData();
    }
  }

  async onItemsPerPageChange(itemsPerPage: number) {
    this.state.update(state => ({
      ...state,
      itemsPerPage,
      currentPage: 1
    }));
    await this.loadData();
  }

  clearSearch() {
    this.onSearch('');
  }

  public get from(): number {
    const state = this.state();
    return Math.min(
      (state.currentPage - 1) * state.itemsPerPage + 1,
      state.totalRecords
    );
  }

  public get to(): number {
    const state = this.state();
    return Math.min(
      state.currentPage * state.itemsPerPage,
      state.totalRecords
    );
  }

  public get pageNumbers(): number[] {
    return this.tableService.calculatePageRange(
      this.state().currentPage,
      this.state().totalPages
    );
  }

  protected setLoading(loading: boolean) {
    this.state.update(state => ({ ...state, loading }));
  }
}
