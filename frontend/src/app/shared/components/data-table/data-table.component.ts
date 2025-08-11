import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Plus, Minus, X } from 'lucide-angular';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import {
  DataTableConfig,
  DataTableState,
  DataTableColumn,
  DataTableAction
} from './interfaces/datatable.interface';
import { DataTableService } from './services/datatable.service';
import { PaginationService } from '../../services/pagination.service';
import { ErrorHandlerService } from '../../services/error-handler.service';

/**
 * Componente DataTable genérico estilo jQuery DataTables
 * Incluye búsqueda, paginación y ordenamiento integrado
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();
  private readonly dataTableService = inject(DataTableService);
  private readonly paginationService = inject(PaginationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Iconos
  readonly searchIcon = Search;
  readonly clearSearchIcon = X;
  readonly sortAscIcon = ArrowUp;
  readonly sortDescIcon = ArrowDown;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly plusIcon = Plus;
  readonly minusIcon = Minus;

  // Responsive state
  public screenSize = signal<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  public expandedRows = signal<Set<any>>(new Set());

  // Inputs
  @Input({ required: true }) config!: DataTableConfig;
  @Input() initialData?: any[];

  // Outputs
  @Output() dataLoaded = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  // Estado
  public state = signal<DataTableState>({
    loading: false,
    data: [],
    search: '',
    currentPage: 1,
    itemsPerPage: 10,
    totalRecords: 0,
    totalPages: 0,
    sortField: '',
    sortOrder: 'ASC'
  });

  // Action menu state
  showActionMenu = false;
  currentMenuActions: any[] = [];
  currentMenuRow: any = null;
  actionMenuPosition = { top: 0, left: 0 };

  // Computeds
  public visibleColumns = computed(() => {
    const allColumns = this.config.columns.filter(col => col.visible !== false);
    const currentSize = this.screenSize();

    // Filtrar columnas basado en el tamaño de pantalla y prioridad
    return allColumns.filter(col => {
      const priority = col.priority || 'medium';

      switch (currentSize) {
        case 'xs':
          return priority === 'critical' || priority === 'high';
        case 'sm':
          return priority === 'critical' || priority === 'high' || priority === 'medium';
        case 'md':
        case 'lg':
        case 'xl':
        default:
          return true; // Mostrar todas
      }
    });
  });

  public hiddenColumns = computed(() => {
    const visibleFields = new Set(this.visibleColumns().map(col => col.field));
    return this.config.columns.filter(col =>
      col.visible !== false && !visibleFields.has(col.field)
    );
  });

  public hasHiddenColumns = computed(() => this.hiddenColumns().length > 0);

  public hasActions = computed(() =>
    this.config.actions && this.config.actions.length > 0
  );

  public totalColumns = computed(() => {
    let count = this.visibleColumns().length;
    // Columna para acciones
    if (this.hasActions()) count++;
    return count;
  });

  public paginationRange = computed(() => {
    const s = this.state();

    // Calcular from y to aquí mismo para evitar dependencias circulares
    const from = Math.min((s.currentPage - 1) * s.itemsPerPage + 1, s.totalRecords);
    const to = Math.min(s.currentPage * s.itemsPerPage, s.totalRecords);

    const pagination = {
      current_page: s.currentPage,
      per_page: s.itemsPerPage,
      total_records: s.totalRecords,
      total_pages: s.totalPages,
      has_next_page: s.currentPage < s.totalPages,
      has_previous_page: s.currentPage > 1,
      from: from,
      to: to
    };

    const range = this.paginationService.calculatePageRange(pagination);

    return {
      pages: range.pages,
      showFirstEllipsis: range.showStartEllipsis,
      showLastEllipsis: range.showEndEllipsis
    };
  });

  public from = computed(() => {
    const s = this.state();
    return Math.min((s.currentPage - 1) * s.itemsPerPage + 1, s.totalRecords);
  });

  public to = computed(() => {
    const s = this.state();
    return Math.min(s.currentPage * s.itemsPerPage, s.totalRecords);
  });

  ngOnInit() {
    // Inicializar estado
    this.state.set(this.dataTableService.createInitialState(this.config));

    // Configurar debounce para búsqueda
    this.searchSubject$
      .pipe(
        debounceTime(300), // Esperar 300ms después del último keystroke
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.state.update(s => ({
          ...s,
          search: searchTerm,
          currentPage: 1
        }));
        this.loadData();
      });

    // Detectar tamaño inicial
    this.updateScreenSize();

    // Cargar datos iniciales
    if (this.initialData) {
      this.state.update(s => ({ ...s, data: this.initialData! }));
    } else {
      this.loadData();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateScreenSize();
  }

  private updateScreenSize() {
    const width = window.innerWidth;
    if (width < 640) {
      this.screenSize.set('xs');
    } else if (width < 768) {
      this.screenSize.set('sm');
    } else if (width < 1024) {
      this.screenSize.set('md');
    } else if (width < 1280) {
      this.screenSize.set('lg');
    } else {
      this.screenSize.set('xl');
    }
  }

  ngOnDestroy() {
    // Limpiar menu de acciones
    this.closeActionMenu();

    // Limpiar observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadData() {
    this.state.update(s => ({ ...s, loading: true }));

    try {
      const response = await this.dataTableService.loadData(this.config, this.state());

      if (response.success) {
        // Determinar el array de datos (compatibilidad con diferentes formatos)
        const dataArray = response.data.data || response.data.users || [];

        this.state.update(s => ({
          ...s,
          data: dataArray,
          totalRecords: response.data.pagination.total_records,
          totalPages: response.data.pagination.total_pages,
          loading: false
        }));

        this.dataLoaded.emit(dataArray);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error: any) {
      this.state.update(s => ({ ...s, loading: false }));
      this.error.emit(error.message);
      await this.errorHandler.handleApiError(error, 'Error al cargar datos');
    }
  }

  /**
   * Método público para recargar los datos
   * Útil para después de crear, editar o eliminar registros
   */
  public refresh(): void {
    this.loadData();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject$.next(input.value);
  }

  clearSearch() {
    this.searchSubject$.next('');
  }

  onSort(field: string | keyof any) {
    const column = this.config.columns.find(col => col.field === field);
    if (!column?.sortable) {
      return;
    }

    const currentField = this.state().sortField;
    const currentOrder = this.state().sortOrder;

    let newOrder: 'ASC' | 'DESC' = 'ASC';
    if (currentField === field) {
      newOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
    }

    this.state.update(s => ({
      ...s,
      sortField: field as string,
      sortOrder: newOrder,
      currentPage: 1
    }));

    this.loadData();
  }

  onItemsPerPageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newItemsPerPage = parseInt(select.value);

    this.state.update(s => ({
      ...s,
      itemsPerPage: newItemsPerPage,
      currentPage: 1
    }));

    this.loadData();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.state().totalPages) {
      this.state.update(s => ({ ...s, currentPage: page }));
      this.loadData();
    }
  }

  getCellValue(row: any, column: DataTableColumn): any {
    const keys = String(column.field).split('.');
    let value = row;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }

    return value;
  }

  formatCellValue(row: any, column: DataTableColumn): string {
    const value = this.getCellValue(row, column);

    if (value === null || value === undefined) {
      return '';
    }

    if (column.format) {
      return column.format(value, row);
    }

    return String(value);
  }

  formatDate(value: any): string {
    if (!value) return '';

    try {
      const date = new Date(value);
      // Formato compacto YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return String(value);
    }
  }

  getBadgeClass(value: any): string {
    // Lógica personalizable para clases de badges
    switch (String(value).toLowerCase()) {
      case 'activo':
      case 'active':
        return 'badge-success';
      case 'inactivo':
      case 'inactive':
        return 'badge-error';
      case 'pendiente':
      case 'pending':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  }

  getVisibleActions(row: any): DataTableAction[] {
    if (!this.config.actions) return [];

    return this.config.actions.filter(action =>
      !action.condition || action.condition(row)
    );
  }

  getSecondaryActions(row: any): DataTableAction[] {
    return this.getVisibleActions(row).filter(action => !action.primary);
  }

  getActionClass(action: DataTableAction): string {
    // Si es la acción principal, usar estilo primario automáticamente
    if (action.primary) {
      return 'btn-primary';
    }

    // Si tiene variante específica, usarla
    switch (action.variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-error';
      case 'ghost':
        return 'btn-ghost';
      default:
        return 'btn-ghost';
    }
  }

  async executeAction(action: DataTableAction, row: any) {
    try {
      await action.onClick(row);
    } catch (error: any) {
      await this.errorHandler.handleApiError(error, `Error al ejecutar ${action.label}`);
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/no-image.png'; // Imagen por defecto
  }

  getSortActive(field: string | keyof any, order: 'ASC' | 'DESC'): boolean {
    return this.state().sortField === field && this.state().sortOrder === order;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  toggleRowExpansion(row: any) {
    const expanded = this.expandedRows();
    const rowId = this.getRowId(row);

    if (expanded.has(rowId)) {
      expanded.delete(rowId);
    } else {
      expanded.add(rowId);
    }

    this.expandedRows.set(new Set(expanded));
  }

  isRowExpanded(row: any): boolean {
    return this.expandedRows().has(this.getRowId(row));
  }

  private getRowId(row: any): any {
    return row.id || JSON.stringify(row);
  }

  toggleActionMenu(event: Event, row: any): void {
    event.stopPropagation();

    if (this.showActionMenu) {
      this.closeActionMenu();
      return;
    }

    const button = event.target as HTMLElement;
    const rect = button.getBoundingClientRect();

    // Posicionar el menu
    this.actionMenuPosition = {
      top: rect.bottom + 4,
      left: Math.max(10, rect.right - 128) // 128px = ancho del menu
    };

    // Configurar contenido
    this.currentMenuActions = this.getSecondaryActions(row);
    this.currentMenuRow = row;
    this.showActionMenu = true;
  }

  closeActionMenu(): void {
    this.showActionMenu = false;
    this.currentMenuActions = [];
    this.currentMenuRow = null;
  }
}
