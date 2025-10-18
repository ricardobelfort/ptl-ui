import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  LoginResponseNormalized, 
  ApiError,
  AuthState 
} from '../interfaces/auth.interface';

/**
 * Mock data for testing
 */
export class MockAuthData {
  static readonly validUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    avatar: 'https://example.com/avatar.jpg'
  };

  static readonly adminUser: User = {
    id: '2',
    email: 'admin@ptl.com',
    name: 'Admin User',
    role: 'admin'
  };

  static readonly validLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
    rememberMe: false
  };

  static readonly adminLoginRequest: LoginRequest = {
    email: 'admin@ptl.com',
    password: '123456',
    rememberMe: true
  };

  static readonly validLoginResponse: LoginResponse = {
    access_token: 'mock_access_token_123',
    token_type: 'Bearer',
    expires_in: '3600',
    perfil: 'user',
    nome: 'Test User'
  };

  static readonly adminLoginResponse: LoginResponse = {
    access_token: 'mock_admin_token_456',
    token_type: 'Bearer',
    expires_in: '7200',
    perfil: 'admin',
    nome: 'Admin User'
  };

  static readonly validNormalizedResponse: LoginResponseNormalized = {
    access_token: 'mock_access_token_123',
    refresh_token: 'mock_refresh_token_789',
    token_type: 'Bearer',
    expires_in: 3600,
    user: MockAuthData.validUser
  };

  static readonly expiredToken = 'expired_token_xyz';
  static readonly validToken = 'valid_token_abc';
  static readonly refreshToken = 'refresh_token_def';

  static readonly authError: ApiError = {
    message: 'Credenciais inválidas',
    code: 'AUTH_001'
  };

  static readonly networkError: ApiError = {
    message: 'Erro de conexão. Verifique sua internet.',
    code: 'NETWORK_001'
  };

  static readonly serverError: ApiError = {
    message: 'Servidor não disponível. Tente novamente mais tarde.',
    code: 'SERVER_001'
  };

  static readonly authenticatedState: AuthState = {
    isAuthenticated: true,
    user: MockAuthData.validUser,
    token: MockAuthData.validToken,
    isLoading: false
  };

  static readonly unauthenticatedState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false
  };

  static readonly loadingState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  };
}

/**
 * Mock AuthService para testes
 */
export class MockAuthService {
  private _isAuthenticated = signal(false);
  private _user = signal<User | null>(null);
  private _isLoading = signal(false);
  private _authState = signal<AuthState>(MockAuthData.unauthenticatedState);

  // Propriedades computadas públicas
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly authState = this._authState.asReadonly();

  // Configuração do comportamento mock
  private shouldSucceed = true;
  private mockError: ApiError = MockAuthData.authError;
  private mockToken: string | null = null;

  /**
   * Configura se o próximo login deve ter sucesso
   */
  setLoginSuccess(success: boolean, error?: ApiError): void {
    this.shouldSucceed = success;
    if (error) {
      this.mockError = error;
    }
  }

  /**
   * Configura o token mock
   */
  setMockToken(token: string | null): void {
    this.mockToken = token;
  }

  /**
   * Simula estado autenticado
   */
  setAuthenticatedState(user?: User): void {
    const userData = user || MockAuthData.validUser;
    this._isAuthenticated.set(true);
    this._user.set(userData);
    this._authState.set({
      isAuthenticated: true,
      user: userData,
      token: MockAuthData.validToken,
      isLoading: false
    });
  }

  /**
   * Simula estado não autenticado
   */
  setUnauthenticatedState(): void {
    this._isAuthenticated.set(false);
    this._user.set(null);
    this._authState.set(MockAuthData.unauthenticatedState);
  }

  /**
   * Mock do método login
   */
  login(credentials: LoginRequest) {
    this._isLoading.set(true);
    
    if (this.shouldSucceed) {
      const response = credentials.email === 'admin@ptl.com' 
        ? MockAuthData.adminLoginResponse 
        : MockAuthData.validLoginResponse;
      
      setTimeout(() => {
        this.setAuthenticatedState();
        this._isLoading.set(false);
      }, 0);
      
      return of({
        access_token: response.access_token,
        refresh_token: MockAuthData.refreshToken,
        token_type: response.token_type,
        expires_in: parseInt(response.expires_in),
        user: credentials.email === 'admin@ptl.com' ? MockAuthData.adminUser : MockAuthData.validUser
      });
    } else {
      this._isLoading.set(false);
      return throwError(() => this.mockError);
    }
  }

  /**
   * Mock do método logout
   */
  logout() {
    this.setUnauthenticatedState();
    return of(undefined);
  }

  /**
   * Mock do método refreshToken
   */
  refreshToken() {
    if (this.shouldSucceed) {
      return of(MockAuthData.validNormalizedResponse);
    } else {
      return throwError(() => this.mockError);
    }
  }

  /**
   * Mock do método getToken
   */
  getToken(): string | null {
    return this.mockToken;
  }

  /**
   * Mock do método isTokenValid
   */
  isTokenValid(): boolean {
    return !!this.mockToken;
  }
}

/**
 * Utilitários para configuração de testes
 */
export class TestUtils {

  /**
   * Configura localStorage para testes
   */
  static setupLocalStorage(token?: string, user?: User): void {
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  /**
   * Limpa localStorage após testes
   */
  static clearLocalStorage(): void {
    localStorage.clear();
  }

  /**
   * Cria um FormGroup mock para testes de componentes
   */
  static createMockFormGroup(valid = true, values: any = {}) {
    const defaultValues = {
      email: valid ? 'test@example.com' : '',
      password: valid ? 'password123' : '',
      rememberMe: false,
      ...values
    };

    return {
      valid,
      value: defaultValues,
      get: (key: string) => ({
        value: defaultValues[key],
        valid: valid,
        hasError: () => !valid,
        setValue: () => {},
        patchValue: () => {}
      }),
      patchValue: () => {},
      reset: () => {}
    };
  }

  /**
   * Aguarda mudanças assíncronas em testes
   */
  static async waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    if (!condition()) {
      throw new Error('Timeout waiting for condition');
    }
  }

  /**
   * Simula uma resposta HTTP com atraso
   */
  static mockHttpResponse<T>(data: T, delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => resolve(of(data)), delay);
    });
  }

  /**
   * Simula um erro HTTP com atraso
   */
  static mockHttpError(error: any, delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => resolve(throwError(() => error)), delay);
    });
  }

  /**
   * Cria um evento de input simulado
   */
  static createInputEvent(value: string): Event {
    const event = new Event('input');
    Object.defineProperty(event, 'target', {
      value: { value },
      enumerable: true
    });
    return event;
  }

  /**
   * Cria um evento de blur simulado
   */
  static createBlurEvent(): Event {
    return new Event('blur');
  }

  /**
   * Cria um evento de click simulado
   */
  static createClickEvent(): Event {
    return new Event('click');
  }
}

/**
 * Constantes para testes
 */
export const TEST_CONSTANTS = {
  API_URLS: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    PROFILE: '/api/v1/auth/me'
  },
  ROUTES: {
    LOGIN: '/login',
    HOME: '/home',
    DASHBOARD: '/dashboard'
  },
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'auth_user'
  },
  HTTP_STATUS: {
    OK: 200,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },
  TIMEOUTS: {
    SHORT: 100,
    MEDIUM: 500,
    LONG: 2000
  }
} as const;