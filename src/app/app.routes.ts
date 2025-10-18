import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { Login } from './features/auth/login/login';
import { Home } from './features/home/home';
import { Form } from './features/internos/form/form';
import { List } from './features/internos/list/list';
import { DashboardLayout } from './shared/components/dashboard/layout/dashboard-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: Login,
    canActivate: [publicGuard]
  },
  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'internos', redirectTo: 'internos/list', pathMatch: 'full' },
      { path: 'internos/list', component: List },
      { path: 'internos/form', component: Form },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
