import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, FileText, TrendingUp, Activity, Calendar, Target, PieChart, DollarSign } from 'lucide-angular';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  // Iconos
  readonly usersIcon = Users;
  readonly filesIcon = FileText;
  readonly trendingIcon = TrendingUp;
  readonly activityIcon = Activity;
  readonly calendarIcon = Calendar;
  readonly targetIcon = Target;
  readonly chartIcon = PieChart;
  readonly dollarIcon = DollarSign;
  
  // Estadísticas mock
  stats = [
    {
      title: 'Usuarios Activos',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      icon: this.usersIcon,
      color: 'text-primary'
    },
    {
      title: 'Documentos',
      value: '1,234',
      change: '+8%',
      trend: 'up',
      icon: this.filesIcon,
      color: 'text-secondary'
    },
    {
      title: 'Tareas Completadas',
      value: '567',
      change: '+23%',
      trend: 'up',
      icon: this.targetIcon,
      color: 'text-accent'
    },
    {
      title: 'Ingresos',
      value: '$89,432',
      change: '+15%',
      trend: 'up',
      icon: this.dollarIcon,
      color: 'text-success'
    }
  ];
  
  // Actividades recientes
  recentActivities = [
    {
      action: 'Nuevo usuario registrado',
      user: 'María González',
      time: 'Hace 5 minutos',
      type: 'user'
    },
    {
      action: 'Documento subido',
      user: 'Carlos López',
      time: 'Hace 12 minutos',
      type: 'document'
    },
    {
      action: 'Tarea completada',
      user: 'Ana Martínez',
      time: 'Hace 25 minutos',
      type: 'task'
    },
    {
      action: 'Reporte generado',
      user: 'Pedro Medrano',
      time: 'Hace 1 hora',
      type: 'report'
    }
  ];
  
  // Tareas pendientes
  pendingTasks = [
    {
      title: 'Revisar documentos pendientes',
      priority: 'Alta',
      dueDate: 'Hoy',
      completed: false
    },
    {
      title: 'Actualizar perfiles de usuario',
      priority: 'Media',
      dueDate: 'Mañana',
      completed: false
    },
    {
      title: 'Generar reporte mensual',
      priority: 'Alta',
      dueDate: 'Esta semana',
      completed: true
    }
  ];
  
  // Método auxiliar para iconos de actividad
  getActivityIcon(type: string) {
    switch (type) {
      case 'user':
        return this.usersIcon;
      case 'document':
        return this.filesIcon;
      case 'task':
        return this.targetIcon;
      case 'report':
        return this.chartIcon;
      default:
        return this.activityIcon;
    }
  }
}
