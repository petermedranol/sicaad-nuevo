import { Routes } from '@angular/router';
import { LoginPageComponent } from './auth/pages/login-page/login-page.component';
import { LoginLayoutComponent } from './shared/layouts/login-layout/login-layout.component';
import { authGuard } from './auth/guards/auth.guard';
import { loginGuard } from './auth/guards/login.guard';
import { loadingGuard } from './shared/guards/loading.guard';
import { permissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginLayoutComponent,
    canActivate: [loginGuard],
    children: [
      { path: '', component: LoginPageComponent },
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },
  {
    path: 'configuration',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: 'users',
        canActivate: [permissionGuard],
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
