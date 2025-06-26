import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ChevronRight, Home, Users, FileText, BarChart3, Settings, Building2, UserCheck, Shield, Database, Archive } from 'lucide-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MenuService } from '../../services/menu.service';

// Re-exportar la interfaz para que otros componentes puedan usarla
export type { MenuItem } from '../../interfaces/menu-item.interface';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar-menu.component.html',
  styles: []
})
export class SidebarMenuComponent {
  constructor(private sanitizer: DomSanitizer) {}
  @Input() menuItems: MenuItem[] = [];
  private _filteredItems: MenuItem[] = [];
  @Input() level: number = 0;
  @Input() expandedItems: Set<string> = new Set();
  @Input() activeItem: string | null = null;
  @Input() searchQuery: string = '';
  private menuService = inject(MenuService);
  @Input() isCollapsed: boolean = false;

  @Output() itemClick = new EventEmitter<MenuItem>();
  @Output() toggleExpanded = new EventEmitter<string>();
  @Output() navigate = new EventEmitter<string>();

  chevronDown = ChevronDown;
  chevronRight = ChevronRight;

  private iconMap: { [key: string]: any } = {
    'Home': Home,
    'Users': Users,
    'FileText': FileText,
    'BarChart3': BarChart3,
    'Settings': Settings,
    'Building2': Building2,
    'UserCheck': UserCheck,
    'Shield': Shield,
    'Database': Database,
    'Archive': Archive
  };

  hoveredItemId: string | null = null;

  private hoverTimeout: any;

  onMouseEnter(itemId: string, event: MouseEvent) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Actualizar la posición del menú
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--menu-top', `${rect.top}px`);
    });
    
    this.hoveredItemId = itemId;
  }

  onMouseLeave() {
    this.hoverTimeout = setTimeout(() => {
      this.hoveredItemId = null;
    }, 300); // Incrementamos el delay para dar más tiempo al usuario
  }

  onItemClick(item: MenuItem, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.hasChildren(item)) {
      this.toggleExpanded.emit(item.id);
    } else if (item.route) {
      this.itemClick.emit(item);
      this.navigate.emit(item.route);
    }
  }

  isItemExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  isItemActive(itemId: string): boolean {
    return this.activeItem === itemId;
  }

  hasChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  getIconByName(iconName: string) {
    return this.iconMap[iconName] || Home;
  }

  // Variable para almacenar las posiciones de los menús
  private menuPositions = new Map<string, number>();

  getMenuTopPosition(itemId: string): number {
    return this.menuPositions.get(itemId) || 0;
  }

  private filterItems(items: MenuItem[], query: string): MenuItem[] {
    if (!query || query.trim() === '') {
      return items;
    }

    query = query.toLowerCase().trim();
    return items.filter(item => {
      const titleMatch = item.title?.toLowerCase().includes(query);
      const descriptionMatch = item.description?.toLowerCase().includes(query);
      
      // Si el item tiene hijos, también los filtramos
      if (item.children && item.children.length > 0) {
        const filteredChildren = this.filterItems(item.children, query);
        if (filteredChildren.length > 0) {
          return true;
        }
      }
      
      return titleMatch || descriptionMatch;
    });
  }

  get filteredMenuItems(): MenuItem[] {
    return this.filterItems(this.menuItems, this.searchQuery);
  }

  private getSearchQuery(): string {
    return this.menuService.currentSearchQuery;
  }

  highlightText(text: string): any {
    // Debug input
    console.log('🔍 Input ->', {
      text: text,
      searchQuery: this.getSearchQuery(),
      hasText: !!text,
      hasQuery: !!this.searchQuery
    });

    const query = this.getSearchQuery();
    if (!text || !query || query.trim() === '') {
      console.log('⚠️ Returning original text - No text or query');
      return text;
    }

    const normalizedQuery = query.trim();
    const pattern = `(${this.escapeRegExp(query)})`;
    const regex = new RegExp(pattern, 'gi');

    console.log('🎯 Search pattern ->', pattern);

    try {
      const html = `<span style="color: inherit !important; border-bottom: 2px solid #ff8c00 !important; display: inline !important; position: relative !important;">$1</span>`;
      console.log('📝 HTML template ->', html);

      const highlighted = text.replace(regex, html);
      console.log('✨ Generated HTML ->', highlighted);

      const result = this.sanitizer.bypassSecurityTrustHtml(highlighted);
      console.log('🔒 Final result ->', result);

      return result;
    } catch (error) {
      console.error('❌ Error in highlighting:', error);
      return text;
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
