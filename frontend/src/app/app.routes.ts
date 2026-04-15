import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'workers',
        loadComponent: () => import('./pages/workers/workers.component').then(m => m.WorkersComponent),
      },
      {
        path: 'workers/:id',
        loadComponent: () => import('./pages/workers/worker-detail.component').then(m => m.WorkerDetailComponent),
      },
      {
        path: 'businesses',
        loadComponent: () => import('./pages/businesses/businesses.component').then(m => m.BusinessesComponent),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./pages/bookings/bookings.component').then(m => m.BookingsComponent),
      },
      {
        path: 'bookings/new',
        loadComponent: () => import('./pages/bookings/new-booking.component').then(m => m.NewBookingComponent),
      },
      {
        path: 'attendance',
        loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent),
      },
      {
        path: 'payroll',
        loadComponent: () => import('./pages/payroll/payroll.component').then(m => m.PayrollComponent),
      },
      {
        path: 'supervisors',
        loadComponent: () => import('./pages/supervisors/supervisors.component').then(m => m.SupervisorsComponent),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
