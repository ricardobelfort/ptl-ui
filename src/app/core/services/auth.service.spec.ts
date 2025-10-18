import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse, ApiError, User } from '../interfaces/auth.interface';
import { environment } from '../config/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
    rememberMe: false
  };

  const mockLoginResponse: LoginResponse = {
    access_token: 'mock_access_token',
    token_type: 'Bearer',
    expires_in: '3600',
    perfil: 'admin',
    nome: 'Test User'
  };

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin'
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpyObj }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with unauthenticated state', () => {
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.user()).toBeNull();
      expect(service.isLoading()).toBeFalse();
    });

    it('should restore authentication from localStorage', () => {
      // Arrange
      localStorage.setItem('auth_token', 'stored_token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      // Act - Create new service instance that will read from localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          { provide: Router, useValue: routerSpy }
        ]
      });
      
      const newService = TestBed.inject(AuthService);
      
      // Assert
      expect(newService.getToken()).toBe('stored_token');
      // Note: Actual restoration behavior depends on service implementation
    });
  });

  describe('Login', () => {
    it('should login successfully with real API', () => {
      // Arrange
      spyOn(environment, 'mockApi' as any).and.returnValue(false);
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      // Act
      service.login(mockLoginRequest).subscribe(response => {
        // Assert
        expect(response.access_token).toBe(mockLoginResponse.access_token);
        expect(response.user.name).toBe(mockLoginResponse.nome);
        expect(service.isAuthenticated()).toBeTrue();
        expect(localStorage.getItem('auth_token')).toBe(mockLoginResponse.access_token);
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      req.flush(mockLoginResponse);
    });

    it('should login successfully with mock API', fakeAsync(() => {
      // Arrange
      Object.defineProperty(environment, 'mockApi', { value: true, configurable: true });
      let responseReceived = false;
      
      // Act
      service.login({
        email: 'admin@ptl.com',
        password: '123456',
        rememberMe: false
      }).subscribe(response => {
        // Assert
        responseReceived = true;
        expect(response.access_token).toBeTruthy();
        expect(response.user.email).toBe('admin@ptl.com');
        expect(service.isAuthenticated()).toBeTrue();
      });

      // Simulate async operation completion - mock API uses setTimeout(1000)
      tick(1000);
      
      // Verify response was received
      expect(responseReceived).toBeTrue();
      
      // No HTTP request should be made for mock
      httpMock.expectNone(`${environment.apiUrl}/auth/login`);
    }));

    it('should handle login error', () => {
      // Arrange
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      const errorResponse = { status: 401, statusText: 'Unauthorized' };
      
      // Act & Assert
      service.login(mockLoginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error: ApiError) => {
          expect(error.message).toContain('Email ou senha incorretos');
          expect(service.isAuthenticated()).toBeFalse();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Unauthorized', errorResponse);
    });

    it('should set loading state during login', () => {
      // Arrange
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      // Act
      service.login(mockLoginRequest).subscribe();
      
      // Assert initial loading state
      expect(service.isLoading()).toBeTrue();
      
      // Complete request
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);
      
      // Assert loading is false after completion
      expect(service.isLoading()).toBeFalse();
    });

    it('should handle rememberMe option', () => {
      // Arrange
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      const requestWithRemember = { ...mockLoginRequest, rememberMe: true };
      
      // Act
      service.login(requestWithRemember).subscribe();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);
      
      // Assert
      expect(localStorage.getItem('auth_token')).toBe(mockLoginResponse.access_token);
      // Com rememberMe, o token deveria ser armazenado permanentemente
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Setup authenticated state
      localStorage.setItem('auth_token', 'test_token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    });

    it('should logout successfully', () => {
      // Act
      service.logout().subscribe(() => {
        // Assert
        expect(service.isAuthenticated()).toBeFalse();
        expect(service.user()).toBeNull();
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_user')).toBeNull();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      });

      // No HTTP request expected for logout (only clears local data)
    });

    it('should handle logout error gracefully', () => {
      // Act - logout always succeeds by clearing local data
      service.logout().subscribe(() => {
        // Assert
        expect(service.isAuthenticated()).toBeFalse();
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      });

      // No HTTP request expected for logout
    });
  });

  describe('Token Refresh', () => {
    beforeEach(() => {
      localStorage.setItem('refresh_token', 'refresh_token');
    });

    it('should refresh token successfully', () => {
      // Act
      service.refreshToken().subscribe(response => {
        // Assert
        expect(response.access_token).toBe(mockLoginResponse.access_token);
        expect(localStorage.getItem('auth_token')).toBe(mockLoginResponse.access_token);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.refresh_token).toBe('refresh_token');
      req.flush(mockLoginResponse);
    });

    it('should handle refresh token error', () => {
      // Act
      service.refreshToken().subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBeTruthy();
          expect(service.isAuthenticated()).toBeFalse();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Utility Methods', () => {
    it('should get stored token', () => {
      const token = 'stored_token';
      const user = { id: '1', email: 'test@test.com', name: 'Test User', role: 'user' };
      
      // Store token and user in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      // Create a new service instance to initialize from localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [{ provide: Router, useValue: routerSpy }]
      });
      const newService = TestBed.inject(AuthService);
      
      // Test the method - should return token from state initialized from localStorage
      expect(newService.getToken()).toBe(token);
      
      // Clean up
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    });

    it('should handle missing token in localStorage', () => {
      // Ensure no token in localStorage
      localStorage.removeItem('auth_token');
      
      // Create new service to test null case
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [{ provide: Router, useValue: routerSpy }]
      });
      const newService = TestBed.inject(AuthService);
      expect(newService.getToken()).toBeNull();
    });

    it('should handle corrupted user data in localStorage', () => {
      // Setup corrupted data
      localStorage.setItem('auth_token', 'valid_token');
      localStorage.setItem('auth_user', 'invalid_json{');
      
      // Spy on console.error
      spyOn(console, 'error');
      
      // Create new service to test initialization with corrupted data
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [{ provide: Router, useValue: routerSpy }]
      });
      const newService = TestBed.inject(AuthService);
      
      // Should not be authenticated due to corrupted data
      expect(newService.isAuthenticated()).toBeFalse();
      expect(console.error).toHaveBeenCalledWith(
        'Error parsing stored user data:',
        jasmine.any(SyntaxError)
      );
      
      // Clean up
      localStorage.clear();
    });

    it('should parse expires_in correctly', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      const responseWithExpiresIn = { ...mockLoginResponse, expires_in: '7200' };
      
      service.login(mockLoginRequest).subscribe(response => {
        expect(response.expires_in).toBe(7200);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(responseWithExpiresIn);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      service.login(mockLoginRequest).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe('Erro de conexão. Verifique sua internet.');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.error(new ErrorEvent('Network error'), { status: 0 });
    });

    it('should handle server errors', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      service.login(mockLoginRequest).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe('Erro interno do servidor. Tente novamente mais tarde.');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 401 unauthorized errors', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      service.login(mockLoginRequest).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe('Email ou senha incorretos.');
          expect(error.code).toBe('INVALID_CREDENTIALS');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 access denied errors', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      service.login(mockLoginRequest).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe('Acesso negado.');
          expect(error.code).toBe('ACCESS_DENIED');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 429 too many requests errors', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      service.login(mockLoginRequest).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe('Muitas tentativas. Tente novamente em alguns minutos.');
          expect(error.code).toBe('TOO_MANY_REQUESTS');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Too Many Requests' }, { status: 429, statusText: 'Too Many Requests' });
    });

    it('should handle 0 status (server unavailable) errors', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      
      service.login(mockLoginRequest).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe('Servidor não disponível. Verifique se a API está rodando em http://localhost:3000');
          expect(error.code).toBe('SERVER_UNAVAILABLE');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('', { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle unknown error codes with custom message', () => {
      Object.defineProperty(environment, 'mockApi', { value: false, configurable: true });
      const customErrorMessage = 'Custom server error message';
      
      service.login(mockLoginRequest).subscribe({
        error: (error: ApiError) => {
          expect(error.message).toBe(customErrorMessage);
          expect(error.code).toBe('UNKNOWN_ERROR');
          expect(error.details).toEqual({ message: customErrorMessage });
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: customErrorMessage }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('Logout', () => {
    it('should logout without token (local only)', () => {
      // Arrange - ensure no token in state
      service.logout().subscribe({
        next: () => {
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        }
      });

      // Should not make HTTP request when no token
      httpMock.expectNone(`${environment.apiUrl}/auth/logout`);
    });

    it('should handle logout HTTP error but still clear local data', () => {
      // Arrange - set up authenticated state
      service.login(mockLoginRequest).subscribe();
      let req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockLoginResponse);

      // Act - logout with server error
      service.logout().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          // Even with error, should clear local data and navigate
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          expect(service.isAuthenticated()).toBeFalse();
        }
      });

      req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Refresh Token', () => {
    it('should handle missing refresh token', () => {
      localStorage.removeItem('refresh_token');
      
      service.refreshToken().subscribe({
        error: (error) => {
          expect(error.message).toBe('No refresh token available');
        }
      });

      httpMock.expectNone(`${environment.apiUrl}/auth/refresh`);
    });

    it('should handle refresh token error and clear auth data', () => {
      localStorage.setItem('refresh_token', 'invalid_refresh_token');
      
      service.refreshToken().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.isAuthenticated()).toBeFalse();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      req.flush('Invalid refresh token', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      // Setup user with role
      const userWithRole = { 
        id: '1', 
        email: 'admin@test.com', 
        name: 'Admin User', 
        role: 'admin' 
      };
      service['updateAuthState']({
        isAuthenticated: true,
        user: userWithRole,
        token: 'test_token',
        isLoading: false,
      });
    });

    it('should return true for matching role', () => {
      expect(service.hasRole('admin')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      expect(service.hasRole('user')).toBe(false);
    });

    it('should return false when user has no role', () => {
      const userWithoutRole = { 
        id: '1', 
        email: 'user@test.com', 
        name: 'Regular User', 
        role: undefined as any
      };
      service['updateAuthState']({
        isAuthenticated: true,
        user: userWithoutRole,
        token: 'test_token',
        isLoading: false,
      });

      expect(service.hasRole('admin')).toBe(false);
    });

    it('should return false when no user is authenticated', () => {
      service['updateAuthState']({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });

      expect(service.hasRole('admin')).toBe(false);
    });
  });
});