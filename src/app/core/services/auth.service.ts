import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment, mockAuthData } from '../config/environment';
import { ApiError, AuthState, LoginRequest, LoginResponse, LoginResponseNormalized, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
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
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  // Timer para renovação automática do token
  private refreshTimer?: Subscription;

  constructor() {
    this.initializeAuth();

    // Expor no window apenas em desenvolvimento para testes
    if (!environment.production) {
      (window as any).authService = this;
    }
  }

  ngOnDestroy(): void {
    this.clearRefreshTimer();
  }

  /**
   * Inicializa o estado de autenticação a partir do localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        // Verifica se o token ainda é válido
        if (expiryStr) {
          const expiryTime = parseInt(expiryStr);
          const now = Date.now();

          if (now >= expiryTime) {
            // Token expirado, tenta renovar
            console.log('Token expired on initialization, attempting refresh...');
            this.refreshToken().subscribe({
              error: () => {
                console.log('Refresh failed, clearing auth data');
                this.clearAuthData();
              }
            });
            return;
          }

          // Token ainda válido, configura timer
          const remainingTime = Math.floor((expiryTime - now) / 1000);
          this.setupTokenRefreshTimer(remainingTime);
        }

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
    // Decodifica o JWT para extrair informações do usuário
    const tokenData = this.decodeJwtToken(response.access_token);

    // Preserva dados do usuário atual se estiver fazendo refresh (response pode não ter nome/perfil)
    const currentUser = this._authState().user;

    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      token_type: response.token_type,
      expires_in: this.parseExpiresIn(response.expires_in),
      user: {
        id: tokenData.sub || currentUser?.id || 'unknown',
        email: tokenData.email || currentUser?.email || 'admin@ptl.local',
        name: response.nome || currentUser?.name || 'Administrador Geral',
        role: response.perfil || tokenData.perfil || currentUser?.role || 'ADMIN',
        avatar: currentUser?.avatar || undefined,
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
   * Decodifica o JWT token para extrair informações do payload
   */
  private decodeJwtToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return {};
    }
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
   * Mock de refresh token para desenvolvimento
   */
  private mockRefreshTokenRequest(): Observable<LoginResponseNormalized> {
    const currentUser = this._authState().user;

    if (!currentUser) {
      return throwError(() => new Error('No user data available for refresh'));
    }

    // Simula delay de rede e retorna novos tokens mantendo o usuário atual
    return new Observable<LoginResponseNormalized>((observer) => {
      setTimeout(() => {
        const refreshResponse: LoginResponseNormalized = {
          access_token: 'new_mock_jwt_token_' + Date.now(),
          refresh_token: 'new_mock_refresh_token_' + Date.now(),
          token_type: 'Bearer',
          expires_in: 3600,
          user: currentUser, // Mantém o usuário atual
        };

        console.log('🔄 Mock refresh token successful, preserving user:', currentUser);
        observer.next(refreshResponse);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Realiza logout do usuário (apenas local - sem chamada para API)
   */
  logout(): Observable<void> {
    console.log('Logging out user...');
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
      console.log('No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('Attempting to refresh token...');

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, {
      refresh_token: refreshToken,
    }).pipe(
      map((response) => this.normalizeLoginResponse(response)),
      tap((normalizedResponse) => {
        console.log('Token refreshed successfully');
        this.handleLoginSuccess(normalizedResponse, true);
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
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
   * Força a verificação e renovação do token se necessário
   */
  checkAndRefreshToken(): Observable<boolean> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    if (this.isTokenNearExpiry()) {
      console.log('Token near expiry, refreshing...');
      return this.refreshToken().pipe(
        map(() => true),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          return throwError(() => error);
        })
      );
    }

    return new Observable(subscriber => {
      subscriber.next(true);
      subscriber.complete();
    });
  }

  /**
   * Trata o sucesso do login
   */
  private handleLoginSuccess(response: LoginResponseNormalized, rememberMe = false): void {
    const { access_token, refresh_token, user, expires_in } = response;

    // Calcula quando o token expira (em milissegundos)
    const expiryTime = Date.now() + (expires_in * 1000);

    // Salva no localStorage
    localStorage.setItem(this.TOKEN_KEY, access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

    // Sempre salva o refresh_token se existir (necessário para renovação automática)
    if (refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh_token);
    }

    // Atualiza o estado
    this.updateAuthState({
      isAuthenticated: true,
      user,
      token: access_token,
      isLoading: false,
    });

    // Configura timer para renovação automática
    this.setupTokenRefreshTimer(expires_in);
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
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    this.clearRefreshTimer();

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  }

  /**
   * Configura timer para renovação automática do token
   */
  private setupTokenRefreshTimer(expiresInSeconds: number): void {
    this.clearRefreshTimer();

    // Renova o token 5 minutos antes de expirar (ou na metade do tempo se for menor que 10 minutos)
    const refreshTime = expiresInSeconds > 600 ? expiresInSeconds - 300 : expiresInSeconds / 2;
    const refreshTimeMs = refreshTime * 1000;

    console.log(`Token refresh scheduled in ${refreshTime} seconds`);

    this.refreshTimer = timer(refreshTimeMs).pipe(
      switchMap(() => {
        console.log('Auto-refreshing token...');
        return this.refreshToken();
      })
    ).subscribe({
      next: () => {
        console.log('Token refreshed successfully');
      },
      error: (error) => {
        console.error('Auto-refresh failed:', error);
        // Se falhar, tenta fazer logout
        this.logout().subscribe();
      }
    });
  }

  /**
   * Limpa o timer de renovação
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = undefined;
    }
  }

  /**
   * Verifica se o token está próximo do vencimento
   */
  private isTokenNearExpiry(): boolean {
    const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true;

    const expiryTime = parseInt(expiryStr);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos em ms

    return (expiryTime - now) < fiveMinutes;
  }

  /**
   * Método de teste - define um token com tempo de expiração curto (2 minutos)
   * APENAS para testes - remover em produção
   */
  public setShortExpiryForTesting(): void {
    if (!environment.production) {
      const shortExpiry = Date.now() + (2 * 60 * 1000); // 2 minutos
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, shortExpiry.toString());
      console.log('🧪 Test mode: Token will expire in 2 minutes');

      // Reconfigura o timer para 1 minuto (renova 1 min antes de expirar)
      this.setupTokenRefreshTimer(60); // 60 segundos
    }
  }

  /**
   * Método de teste - mostra informações do token atual
   * APENAS para testes - remover em produção  
   */
  public getTokenInfo(): any {
    if (!environment.production) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const expiryStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

      return {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        tokenLength: token?.length,
        expiryTime: expiryStr ? new Date(parseInt(expiryStr)).toLocaleString() : null,
        timeUntilExpiry: expiryStr ? Math.floor((parseInt(expiryStr) - Date.now()) / 1000) : null,
        isNearExpiry: this.isTokenNearExpiry()
      };
    }
    return null;
  }
}