import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rotas que requerem autenticação
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se já está autenticado, permite acesso
  if (authService.isAuthenticated()) {
    return true;
  }

  // Se há token armazenado, valida com o servidor
  const token = authService.getToken();
  if (token) {
    return authService.validateToken().pipe(
      map(() => true),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  }

  // Se não há token, redireciona para login
  router.navigate(['/login']);
  return false;
};

/**
 * Guard que impede acesso a rotas públicas quando já autenticado
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se já está autenticado, redireciona para home
  if (authService.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};

/**
 * Guard que protege rotas que requerem privilégios de admin
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primeiro verifica se está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Verifica se o usuário é admin
  const user = authService.user();
  if (!user || user.role !== 'admin') {
    router.navigate(['/home']);
    return false;
  }

  return true;
};