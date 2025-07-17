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
import { LucideAngularModule, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';

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
  styles: [`
    .data-table-container {
      position: relative;
      overflow: visible;
      isolation: isolate;
    }

    .table-wrapper {
      overflow-x: auto;
      overflow-y: visible;
      position: relative;
      z-index: 1;
    }

    /* Forzar dropdowns fuera del stacking context de la tabla */
    .dropdown {
      position: static !important;
    }

    .dropdown-content {
      position: fixed !important;
      z-index: 999999 !important;
      background-color: white !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 8px !important;
      transform: none !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
    }

    /* Para el dropdown-end, posicionar manualmente */
    .dropdown-end .dropdown-content {
      position: fixed !important;
      z-index: 999999 !important;
    }

    /* Asegurar que el dropdown tenga el z-index más alto posible */
    .dropdown[open] .dropdown-content,
    .dropdown:focus .dropdown-content,
    .dropdown:focus-within .dropdown-content {
      position: fixed !important;
      z-index: 999999 !important;
      display: block !important;
    }

    /* Resolver conflictos con el overflow de la tabla */
    .table-wrapper .dropdown-content {
      position: fixed !important;
      z-index: 999999 !important;
    }
  `],
  template: `
    <div class="data-table-container">
      <!-- Header con búsqueda y controles -->
      <div class="flex flex-col gap-4 mb-6" *ngIf="config.searchable || config.pagination">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <!-- Búsqueda -->
          <div class="relative flex-1 max-w-sm" *ngIf="config.searchable">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucide-icon [img]="searchIcon" class="h-4 w-4 text-base-content/50" />
            </div>
            <input
              type="text"
              class="input input-bordered w-full pl-10"
              [placeholder]="config.searchPlaceholder || 'Buscar...'"
              [value]="state().search"
              (input)="onSearch($event)"
            />
          </div>

          <!-- Selector de elementos por página -->
          <div class="flex items-center gap-2" *ngIf="config.pagination">
            <span class="text-sm text-base-content/70">Mostrar</span>
            <select
              class="select select-bordered select-sm"
              [value]="state().itemsPerPage"
              (change)="onItemsPerPageChange($event)"
            >
              <option
                *ngFor="let option of config.itemsPerPageOptions || [10, 25, 50]"
                [value]="option"
              >
                {{ option }}
              </option>
            </select>
            <span class="text-sm text-base-content/70">registros</span>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-wrapper overflow-x-auto">
        <table class="table"
               [class.table-striped]="config.striped"
               [class.table-hover]="config.hoverable">
          <!-- Header -->
          <thead *ngIf="config.showHeader !== false">
            <tr>
              <th
                *ngFor="let column of visibleColumns()"
                [class]="column.class"
                [style.width]="column.width"
                [class.cursor-pointer]="column.sortable"
                (click)="onSort(column.field)"
              >
                <div class="flex items-center gap-2">
                  <span>{{ column.header }}</span>
                  <div class="flex flex-col" *ngIf="column.sortable">
                    <lucide-icon
                      [img]="sortAscIcon"
                      class="h-3 w-3"
                      [ngClass]="{
                        'text-primary': getSortActive(column.field, 'ASC'),
                        'text-base-content/30': !getSortActive(column.field, 'ASC')
                      }" />
                    <lucide-icon
                      [img]="sortDescIcon"
                      class="h-3 w-3"
                      [ngClass]="{
                        'text-primary': getSortActive(column.field, 'DESC'),
                        'text-base-content/30': !getSortActive(column.field, 'DESC')
                      }" />
                  </div>
                </div>
              </th>
              <th *ngIf="hasActions()" class="w-24">Acciones</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <!-- Loading -->
            <tr *ngIf="state().loading">
              <td [attr.colspan]="totalColumns()" class="text-center py-8">
                <div class="flex items-center justify-center gap-2">
                  <span class="loading loading-spinner loading-sm"></span>
                  <span>{{ config.loadingMessage || 'Cargando datos...' }}</span>
                </div>
              </td>
            </tr>

            <!-- Empty -->
            <tr *ngIf="!state().loading && state().data.length === 0">
              <td [attr.colspan]="totalColumns()" class="text-center py-8 text-base-content/50">
                {{ config.emptyMessage || 'No se encontraron registros' }}
              </td>
            </tr>

            <!-- Data rows -->
            <ng-container *ngFor="let row of state().data; trackBy: trackByFn">
              <!-- Fila principal -->
              <tr class="relative">
                <!-- Columnas visibles -->
                <td
                  *ngFor="let column of visibleColumns(); let i = index"
                  [class]="column.class"
                  class="relative"
                >
                  <ng-container [ngSwitch]="column.template">
                    <!-- Image template -->
                    <div *ngSwitchCase="'image'" class="avatar">
                      <div class="w-10 h-10 rounded-full">
                        <img
                          [src]="formatCellValue(row, column)"
                          [alt]="column.header"
                          class="w-full h-full object-cover"
                          (error)="onImageError($event)"
                        />
                      </div>
                    </div>

                    <!-- Badge template -->
                    <span *ngSwitchCase="'badge'"
                          class="badge"
                          [class]="getBadgeClass(getCellValue(row, column))">
                      {{ formatCellValue(row, column) }}
                    </span>

                    <!-- Date template -->
                    <span *ngSwitchCase="'date'">
                      {{ formatDate(getCellValue(row, column)) }}
                    </span>

                    <!-- Custom template -->
                    <div *ngSwitchCase="'custom'" [innerHTML]="column.render!(getCellValue(row, column), row)"></div>

                    <!-- Default text template -->
                    <span *ngSwitchDefault>
                      {{ formatCellValue(row, column) }}
                    </span>
                  </ng-container>

                  <!-- Floating expansion button (only on first column if has hidden columns) -->
                  <button
                    *ngIf="hasHiddenColumns() && i === 0"
                    (click)="toggleRowExpansion(row)"
                    class="btn btn-xs btn-circle bg-gray-400 hover:bg-gray-500 border-gray-400 absolute bottom-1 left-1 shadow-lg opacity-60 hover:opacity-80 transition-opacity z-10"
                    [attr.aria-label]="row.expanded ? 'Colapsar fila' : 'Expandir fila'"
                  >
                    <svg
                      [class.rotate-45]="row.expanded"
                      class="w-3 h-3 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </button>
                </td>

                <!-- Actions column -->
                <td *ngIf="hasActions()">
                  <div class="join">
                    <!-- Botón principal (acción primary) -->
                    <ng-container *ngFor="let action of getVisibleActions(row)">
                      <button
                        *ngIf="action.primary"
                        type="button"
                        class="join-item btn btn-sm btn-ghost font-normal"
                        [title]="action.label"
                        (click)="executeAction(action, row)"
                      >
                        <lucide-icon
                          *ngIf="action.icon"
                          [img]="action.icon"
                          class="h-3 w-3" />
                        <span class="font-normal">{{ action.label }}</span>
                      </button>
                    </ng-container>

                    <!-- Botón de acciones adicionales -->
                    <div class="relative"
                         *ngIf="getSecondaryActions(row).length > 0">
                      <button
                        type="button"
                        class="join-item btn btn-sm btn-ghost"
                        (click)="toggleActionMenu($event, row)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Fila expandida con columnas ocultas -->
              <tr *ngIf="hasHiddenColumns() && isRowExpanded(row)" class="bg-base-200/50">
                <td [attr.colspan]="totalColumns()" class="py-2">
                  <div class="px-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                      <div *ngFor="let column of hiddenColumns()" class="flex">
                        <span class="font-medium text-base-content/70 mr-2">{{ column.header }}:</span>
                        <span class="text-base-content">
                          <ng-container [ngSwitch]="column.template">
                            <!-- Date template -->
                            <span *ngSwitchCase="'date'">
                              {{ formatDate(getCellValue(row, column)) }}
                            </span>

                            <!-- Badge template -->
                            <span *ngSwitchCase="'badge'"
                                  class="badge badge-sm"
                                  [class]="getBadgeClass(getCellValue(row, column))">
                              {{ formatCellValue(row, column) }}
                            </span>

                            <!-- Default -->
                            <span *ngSwitchDefault>
                              {{ formatCellValue(row, column) }}
                            </span>
                          </ng-container>
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6"
           *ngIf="config.pagination && state().data.length > 0">
        <!-- Información de registros -->
        <div class="text-sm text-base-content/70">
          Mostrando {{ from() }} a {{ to() }} de {{ state().totalRecords }} registros
        </div>

        <!-- Controles de paginación -->
        <div class="join" *ngIf="state().totalPages > 1">
          <!-- Primera página -->
          <button
            class="join-item btn btn-sm"
            [disabled]="state().currentPage === 1"
            (click)="goToPage(1)"
            title="Primera página"
          >
            «
          </button>

          <!-- Página anterior -->
          <button
            class="join-item btn btn-sm"
            [disabled]="state().currentPage === 1"
            (click)="goToPage(state().currentPage - 1)"
            title="Página anterior"
          >
            ‹
          </button>

          <!-- Ellipsis inicial -->
          <button class="join-item btn btn-sm btn-disabled" *ngIf="paginationRange().showFirstEllipsis">
            ...
          </button>

          <!-- Números de página -->
          <button
            *ngFor="let page of paginationRange().pages"
            class="join-item btn btn-sm"
            [class.btn-active]="page === state().currentPage"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>

          <!-- Ellipsis final -->
          <button class="join-item btn btn-sm btn-disabled" *ngIf="paginationRange().showLastEllipsis">
            ...
          </button>

          <!-- Página siguiente -->
          <button
            class="join-item btn btn-sm"
            [disabled]="state().currentPage === state().totalPages"
            (click)="goToPage(state().currentPage + 1)"
            title="Página siguiente"
          >
            ›
          </button>

          <!-- Última página -->
          <button
            class="join-item btn btn-sm"
            [disabled]="state().currentPage === state().totalPages"
            (click)="goToPage(state().totalPages)"
            title="Última página"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- Action Menu Popover -->
    <div *ngIf="showActionMenu"
         class="fixed inset-0 z-50"
         (click)="closeActionMenu()">
      <div class="absolute bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-32"
           [style.top.px]="actionMenuPosition.top"
           [style.left.px]="actionMenuPosition.left"
           (click)="$event.stopPropagation()">
        <button
          *ngFor="let action of currentMenuActions"
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          [class.text-red-600]="action.variant === 'danger'"
          (click)="executeAction(action, currentMenuRow!); closeActionMenu()"
        >
          <lucide-icon
            *ngIf="action.icon"
            [img]="action.icon"
            class="h-3 w-3" />
          {{ action.label }}
        </button>
      </div>
    </div>
  `
})
export class DataTableComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly dataTableService = inject(DataTableService);
  private readonly paginationService = inject(PaginationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Iconos
  readonly searchIcon = Search;
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
    this.state.update(s => ({
      ...s,
      search: input.value,
      currentPage: 1
    }));
    this.loadData();
  }

  onSort(field: string | keyof any) {
    console.log('🔧 onSort llamado con campo:', field);

    const column = this.config.columns.find(col => col.field === field);
    if (!column?.sortable) {
      console.log('🔧 Columna no sorteable:', field);
      return;
    }

    const currentField = this.state().sortField;
    const currentOrder = this.state().sortOrder;

    let newOrder: 'ASC' | 'DESC' = 'ASC';
    if (currentField === field) {
      newOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
    }

    console.log('🔧 Cambio de ordenamiento:', {
      campo: field,
      ordenAnterior: currentOrder,
      ordenNuevo: newOrder,
      campoAnterior: currentField
    });

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
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
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
