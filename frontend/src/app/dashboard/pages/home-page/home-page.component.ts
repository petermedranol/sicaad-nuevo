import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucideFileText,
  lucideTrendingUp,
  lucideActivity,
  lucideUserPlus,
  lucideFilePlus,
  lucideListChecks,
  lucideDollarSign,
  lucideCircleCheck
} from '@ng-icons/lucide';

// Servicios compartidos
import { PageTitleService } from '../../../shared';
import { TopbarService } from '../../../services/topbar.service';

// Interfaces
import { Stat, Activity, Task } from './interfaces/index';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucideFileText,
      lucideTrendingUp,
      lucideActivity,
      lucideUserPlus,
      lucideFilePlus,
      lucideListChecks,
      lucideDollarSign,
      lucideCircleCheck
    })
  ],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit {

  // Iconos
  readonly usersIcon = 'lucideUsers';
  readonly filesIcon = 'lucideFileText';
  readonly trendingIcon = 'lucideTrendingUp';
  readonly activityIcon = 'lucideActivity';
  readonly userPlusIcon = 'lucideUserPlus';
  readonly filePlusIcon = 'lucideFilePlus';
  readonly listChecksIcon = 'lucideListChecks';
  readonly dollarIcon = 'lucideDollarSign';
  readonly checkIcon = 'lucideCircleCheck';
  private readonly pageTitle = inject(PageTitleService);
  private readonly topbarService = inject(TopbarService);

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
      icon: this.checkIcon,
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

  ngOnInit() {
    // Component initialization
    this.pageTitle.setTitle('Dashboard');
    this.topbarService.updateTopbar({
      title: 'Dashboard',
      description: 'Bienvenido al panel de control',

    });
  }

  // Método auxiliar para iconos de actividad
  getActivityIcon(type: string) {
    switch (type) {
      case 'user':
        return this.userPlusIcon;
      case 'document':
        return this.filePlusIcon;
      case 'task':
        return this.listChecksIcon;
      default:
        return this.activityIcon;
    }
  }
}
