import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor para adicionar token de autorização nas requisições
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // URLs que não precisam de autenticação
  const publicUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  // Se não há token ou é uma URL pública, prossegue sem modificar
  if (!token || isPublicUrl) {
    return next(req);
  }

  // Clona a requisição e adiciona o header de autorização
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  return next(authReq).pipe(
    catchError((error) => {
      // Se erro 401 (não autorizado), tenta renovar o token
      if (error.status === 401 && !req.url.includes('/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry da requisição original com o novo token
            const newToken = authService.getToken();
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Se o refresh falhou, redireciona para login
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};