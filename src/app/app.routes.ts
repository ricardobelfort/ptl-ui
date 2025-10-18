import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './features/home/home';
import { List } from './features/internos/list/list';
import { Form } from './features/internos/form/form';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'app',
    component: MainLayout,
    children: [
      { path: 'home', component: Home },
      { path: 'internos', component: List },
      { path: 'internos/cadastro', component: Form },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
