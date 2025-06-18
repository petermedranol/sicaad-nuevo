export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
  level?: number;
  parentId?: string;
  hasPermission?: boolean;
  active?: boolean;
  badge?: {
    text: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'purple';
  };
}

export interface MenuState {
  expandedItems: Set<string>;
  activeItem: string | null;
}

