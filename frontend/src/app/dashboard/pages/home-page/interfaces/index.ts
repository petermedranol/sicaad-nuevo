export interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface Activity {
  action: string;
  user: string;
  time: string;
  type: 'user' | 'document' | 'task' | 'report';
}

export interface Task {
  title: string;
  priority: 'Alta' | 'Media' | 'Baja';
  dueDate: string;
  completed: boolean;
}
