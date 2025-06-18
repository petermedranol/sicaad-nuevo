import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent)
      },
      // Aquí puedes agregar más rutas del dashboard cuando las necesites
      // {
      //   path: 'users',
      //   loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
      // },
    ]
  }
];

