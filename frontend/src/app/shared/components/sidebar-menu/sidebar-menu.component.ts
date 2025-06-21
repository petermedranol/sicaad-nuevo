import { Component, Input, Output, EventEmitter, inject, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, ChevronRight, Home, Users, FileText, BarChart3, Settings, Building2, UserCheck, Shield, Database, Archive } from 'lucide-angular';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { HighlightPipe } from '../../pipes/highlight.pipe';

// Re-exportar la interfaz para que otros componentes puedan usarla
export type { MenuItem } from '../../interfaces/menu-item.interface';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HighlightPipe, forwardRef(() => SidebarMenuComponent)],
  templateUrl: './sidebar-menu.component.html'
})
export class SidebarMenuComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() level: number = 0;
  @Input() expandedItems: Set<string> = new Set();
  @Input() activeItem: string | null = null;
  @Input() searchQuery: string = '';
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
}
