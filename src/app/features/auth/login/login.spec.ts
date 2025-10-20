import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ApiError, LoginRequest } from '../../../core/interfaces/auth.interface';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components';
import { Login } from './login';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLoginResponse = {
    access_token: 'mock_token',
    token_type: 'Bearer',
    expires_in: 3600,
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login'], {
      isLoading: signal(false)
    });
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule, LoadingComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with empty form', () => {
      expect(component['loginForm'].get('email')?.value).toBe('');
      expect(component['loginForm'].get('password')?.value).toBe('');
      expect(component['loginForm'].get('rememberMe')?.value).toBe(false);
    });

    it('should invalidate form with empty fields', () => {
      expect(component['loginForm'].valid).toBeFalsy();
    });

    it('should validate required email', () => {
      const emailControl = component['loginForm'].get('email');

      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTruthy();

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should validate required password with minimum length', () => {
      const passwordControl = component['loginForm'].get('password');

      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTruthy();

      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();

      passwordControl?.setValue('123456');
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should be valid with correct email and password', () => {
      component['loginForm'].patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(component['loginForm'].valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component['loginForm'].patchValue({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      });
    });

    it('should not submit if form is invalid', () => {
      // Make form invalid
      component['loginForm'].patchValue({ email: '' });

      component['onSubmit']();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should submit valid form and navigate on success', () => {
      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      component['onSubmit']();

      const expectedCredentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      expect(authServiceSpy.login).toHaveBeenCalledWith(expectedCredentials);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should handle login error', () => {
      const errorMessage = 'Credenciais inválidas';
      const apiError: ApiError = {
        message: errorMessage,
        code: '401'
      };

      authServiceSpy.login.and.returnValue(throwError(() => apiError));

      component['onSubmit']();

      expect(component['errorMessage']()).toBe(errorMessage);
      expect(component['isLoading']()).toBeFalse();
    });

    it('should set loading state during submission', () => {
      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      // Spy on loading signal
      spyOn(component['isLoading'], 'set');

      component['onSubmit']();

      expect(component['isLoading'].set).toHaveBeenCalledWith(true);
    });

    it('should clear error message on new submission', () => {
      // Set initial error
      component['errorMessage'].set('Previous error');
      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      component['onSubmit']();

      expect(component['errorMessage']()).toBeNull();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should initialize with hidden password', () => {
      expect(component['showPassword']()).toBeFalse();
    });

    it('should toggle password visibility', () => {
      expect(component['showPassword']()).toBeFalse();

      component['togglePasswordVisibility']();
      expect(component['showPassword']()).toBeTrue();

      component['togglePasswordVisibility']();
      expect(component['showPassword']()).toBeFalse();
    });
  });

  describe('Component State', () => {
    it('should have correct initial state', () => {
      expect(component['isLoading']()).toBeFalse();
      expect(component['showPassword']()).toBeFalse();
      expect(component['errorMessage']()).toBeNull();
    });

    it('should update loading state correctly', () => {
      component['isLoading'].set(true);
      expect(component['isLoading']()).toBeTrue();

      component['isLoading'].set(false);
      expect(component['isLoading']()).toBeFalse();
    });

    it('should update error message correctly', () => {
      const errorMsg = 'Test error message';
      component['errorMessage'].set(errorMsg);
      expect(component['errorMessage']()).toBe(errorMsg);

      component['errorMessage'].set(null);
      expect(component['errorMessage']()).toBeNull();
    });
  });

  describe('Template Integration', () => {
    it('should render login form', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('form')).toBeTruthy();
      expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
      expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
      expect(compiled.querySelector('input[type="checkbox"]')).toBeTruthy();
    });

    it('should show validation errors', () => {
      const emailInput = fixture.nativeElement.querySelector('input[type="email"]');
      const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');

      // Trigger validation
      emailInput.value = '';
      emailInput.dispatchEvent(new Event('input'));
      emailInput.dispatchEvent(new Event('blur'));

      passwordInput.value = '123';
      passwordInput.dispatchEvent(new Event('input'));
      passwordInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      // Check if validation messages are shown
      expect(fixture.nativeElement.textContent).toContain('E-mail é obrigatório');
      expect(fixture.nativeElement.textContent).toContain('Senha deve ter pelo menos 6 caracteres');
    });

    it('should show error message when login fails', () => {
      const errorMessage = 'Login failed';
      component['errorMessage'].set(errorMessage);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(errorMessage);
    });

    it('should disable submit button when loading', () => {
      component['isLoading'].set(true);
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTruthy();
    });

    it('should toggle password input type', () => {
      // The PrimeNG p-password component handles toggle internally
      // We just need to test that our component state changes
      expect(component['showPassword']()).toBeFalse();

      component['togglePasswordVisibility']();
      expect(component['showPassword']()).toBeTrue();

      component['togglePasswordVisibility']();
      expect(component['showPassword']()).toBeFalse();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rememberMe value', () => {
      component['loginForm'].patchValue({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: null
      });

      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      component['onSubmit']();

      const expectedCredentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      };

      expect(authServiceSpy.login).toHaveBeenCalledWith(expectedCredentials);
    });

    it('should handle login success without error message reset', () => {
      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      component['onSubmit']();

      expect(component['errorMessage']()).toBeNull();
      expect(component['isLoading']()).toBeFalse();
    });
  });

  describe('Additional User Actions', () => {
    it('should handle forgot password action', () => {
      spyOn(console, 'log');

      component['onForgotPassword']();

      expect(console.log).toHaveBeenCalledWith('Forgot password clicked');
    });

    it('should handle register action', () => {
      spyOn(console, 'log');

      component['onRegister']();

      expect(console.log).toHaveBeenCalledWith('Register clicked');
    });

    it('should handle rememberMe option correctly', () => {
      // Setup form with rememberMe = true
      (component as any).loginForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        rememberMe: true
      });

      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      component['onSubmit']();

      expect(authServiceSpy.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
        rememberMe: true
      });
    });

    it('should handle rememberMe as false when not set', () => {
      // Setup form without rememberMe (should default to false)
      (component as any).loginForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        rememberMe: null // Explicitly null to test the || false logic
      });

      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      component['onSubmit']();

      expect(authServiceSpy.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
        rememberMe: false
      });
    });

    it('should reset error message before login attempt', () => {
      // Set initial error
      component['errorMessage'].set('Previous error');

      // Setup valid form
      (component as any).loginForm.patchValue({
        email: 'test@test.com',
        password: 'password123'
      });

      authServiceSpy.login.and.returnValue(of(mockLoginResponse));

      component['onSubmit']();

      expect(component['errorMessage']()).toBeNull();
    });
  });

  describe('Loading Component Integration', () => {
    beforeEach(() => {
      component['loginForm'].patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should show loading component when isLoading is true', () => {
      component['isLoading'].set(true);
      fixture.detectChanges();

      const loadingComponent = fixture.debugElement.query(By.css('app-loading'));
      expect(loadingComponent).toBeTruthy();
    });

    it('should hide loading component when isLoading is false', () => {
      component['isLoading'].set(false);
      fixture.detectChanges();

      const loadingComponent = fixture.debugElement.query(By.css('app-loading'));
      expect(loadingComponent).toBeFalsy();
    });

    it('should configure loading component with correct props', () => {
      component['isLoading'].set(true);
      fixture.detectChanges();

      const loadingComponent = fixture.debugElement.query(By.css('app-loading'));
      expect(loadingComponent).toBeTruthy();
      expect(loadingComponent.componentInstance.type()).toBe('spinner');
      expect(loadingComponent.componentInstance.size()).toBe('sm');
      expect(loadingComponent.componentInstance.inline()).toBe(true);
    });

    it('should disable submit button when loading', () => {
      component['isLoading'].set(true);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();
    });

    it('should enable submit button when not loading and form is valid', () => {
      component['isLoading'].set(false);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();
    });

    it('should show loading text when isLoading is true', () => {
      component['isLoading'].set(true);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.textContent.trim()).toContain('Entrando...');
    });

    it('should show normal text when isLoading is false', () => {
      component['isLoading'].set(false);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.textContent.trim()).toBe('Entrar');
    });
  });
});
