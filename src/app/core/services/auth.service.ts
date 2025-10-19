import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment, mockAuthData } from '../config/environment';
import { ApiError, AuthState, LoginRequest, LoginResponse, LoginResponseNormalized, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // API Base URL - já inclui /api/v1, só precisamos adicionar /auth nos endpoints
  private readonly apiUrl = environment.apiUrl;

  // Signals para estado da autenticação
  private readonly _authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
  });

  // Computed signals públicos
  readonly authState = this._authState.asReadonly();
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly user = computed(() => this._authState().user);
  readonly isLoading = computed(() => this._authState().isLoading);

  // Storage keys
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'auth_user';

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa o estado de autenticação a partir do localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.updateAuthState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Realiza login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponseNormalized> {
    this.setLoading(true);

    // Durante desenvolvimento, usar mock se habilitado
    if (environment.mockApi) {
      return this.mockLogin(credentials);
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      tap((normalizedResponse) => {
        this.handleLoginSuccess(normalizedResponse, credentials.rememberMe);
      }),
      catchError((error) => this.handleAuthError(error)),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Normaliza a resposta da API para o formato interno
   */
  private normalizeLoginResponse(response: LoginResponse): LoginResponseNormalized {
    return {
      access_token: response.access_token,
      token_type: response.token_type,
      expires_in: this.parseExpiresIn(response.expires_in),
      user: {
        id: Math.random().toString(36), // Gerar ID temporário
        email: '', // Email será obtido do token ou outra chamada
        name: response.nome,
        role: response.perfil,
        avatar: undefined,
      },
    };
  }

  /**
   * Converte expires_in de string para número (em segundos)
   */
  private parseExpiresIn(expiresIn: string): number {
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn.slice(0, -1)) * 60;
    }
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn.slice(0, -1)) * 3600;
    }
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn.slice(0, -1)) * 86400;
    }
    return parseInt(expiresIn) || 3600; // Default 1 hora
  }

  /**
   * Mock de login para desenvolvimento
   */
  private mockLogin(credentials: LoginRequest): Observable<LoginResponseNormalized> {
    const { email, password } = credentials;
    const { validCredentials, loginResponse } = mockAuthData;

    // Simula delay de rede e valida credenciais
    return new Observable<LoginResponseNormalized>((observer) => {
      setTimeout(() => {
        if (email === validCredentials.email && password === validCredentials.password) {
          this.handleLoginSuccess(loginResponse, credentials.rememberMe);
          observer.next(loginResponse);
          observer.complete();
        } else {
          const error: ApiError = {
            message: 'Email ou senha incorretos.',
            code: 'INVALID_CREDENTIALS',
          };
          observer.error(error);
        }
        this.setLoading(false);
      }, 1000);
    });
  }

  /**
   * Realiza logout do usuário (apenas local - sem chamada para API)
   */
  logout(): Observable<void> {
    // Logout é sempre local - limpa os dados e redireciona
    this.clearAuthData();
    this.router.navigate(['/login']);

    return new Observable(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Atualiza o token usando refresh token
   */
  refreshToken(): Observable<LoginResponseNormalized> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, {
      refresh_token: refreshToken,
    }).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      tap((normalizedResponse) => {
        this.handleLoginSuccess(normalizedResponse, true);
      }),
      catchError((error) => {
        this.clearAuthData();
        this.router.navigate(['/login']);
        return this.handleAuthError(error);
      })
    );
  }

  /**
   * Verifica se o token ainda é válido
   */
  validateToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.updateAuthState({
          ...this._authState(),
          user,
          isAuthenticated: true,
        });
      }),
      catchError((error) => {
        this.clearAuthData();
        return this.handleAuthError(error);
      })
    );
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return this._authState().token;
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  hasRole(role: string): boolean {
    return this._authState().user?.role === role;
  }

  /**
   * Trata o sucesso do login
   */
  private handleLoginSuccess(response: LoginResponseNormalized, rememberMe = false): void {
    const { access_token, refresh_token, user } = response;

    // Salva no localStorage
    localStorage.setItem(this.TOKEN_KEY, access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    if (refresh_token && rememberMe) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh_token);
    }

    // Atualiza o estado
    this.updateAuthState({
      isAuthenticated: true,
      user,
      token: access_token,
      isLoading: false,
    });
  }

  /**
   * Trata erros de autenticação
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    this.setLoading(false);

    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      apiError = {
        message: 'Erro de conexão. Verifique sua internet.',
        code: 'CONNECTION_ERROR',
      };
    } else {
      // Erro do servidor
      switch (error.status) {
        case 0:
          apiError = {
            message: 'Servidor não disponível. Verifique se a API está rodando em http://localhost:3000',
            code: 'SERVER_UNAVAILABLE',
          };
          break;
        case 401:
          apiError = {
            message: 'Email ou senha incorretos.',
            code: 'INVALID_CREDENTIALS',
          };
          break;
        case 403:
          apiError = {
            message: 'Acesso negado.',
            code: 'ACCESS_DENIED',
          };
          break;
        case 429:
          apiError = {
            message: 'Muitas tentativas. Tente novamente em alguns minutos.',
            code: 'TOO_MANY_REQUESTS',
          };
          break;
        case 500:
          apiError = {
            message: 'Erro interno do servidor. Tente novamente mais tarde.',
            code: 'SERVER_ERROR',
          };
          break;
        default:
          apiError = {
            message: error.error?.message || 'Erro desconhecido.',
            code: 'UNKNOWN_ERROR',
            details: error.error,
          };
      }
    }

    return throwError(() => apiError);
  }

  /**
   * Atualiza o estado de loading
   */
  private setLoading(isLoading: boolean): void {
    this.updateAuthState({
      ...this._authState(),
      isLoading,
    });
  }

  /**
   * Atualiza o estado de autenticação
   */
  private updateAuthState(newState: AuthState): void {
    this._authState.set(newState);
  }

  /**
   * Limpa todos os dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  }
}