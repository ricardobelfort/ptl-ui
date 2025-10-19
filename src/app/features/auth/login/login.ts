import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  LucideAngularModule,
  Shield,
  User
} from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ApiError, LoginRequest } from '../../../core/interfaces/auth.interface';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    LoadingComponent,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    MessageModule
  ],
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Lucide icons
  protected readonly Lock = Lock;
  protected readonly User = User;
  protected readonly Eye = Eye;
  protected readonly EyeOff = EyeOff;
  protected readonly Shield = Shield;
  protected readonly AlertCircle = AlertCircle;
  protected readonly CheckCircle = CheckCircle;

  protected readonly isLoading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl<boolean>(false),
  });

  // Signal para o valor do checkbox
  protected readonly rememberMeValue = signal<boolean>(false);

  // Model para two-way binding do checkbox
  protected rememberMeModel = false;

  constructor() {
    // Subscribe to changes in the rememberMe form control
    this.loginForm.get('rememberMe')?.valueChanges.subscribe(value => {
      this.rememberMeValue.set(value || false);
      this.rememberMeModel = value || false;
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const credentials: LoginRequest = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
        rememberMe: this.loginForm.value.rememberMe || false,
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          // Login bem-sucedido, redireciona para home
          this.router.navigate(['/home']);
        },
        error: (error: ApiError) => {
          // Exibe erro para o usuário
          this.errorMessage.set(error.message);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }

  protected onForgotPassword(): void {
    // TODO: Implementar lógica de esqueceu senha
    console.log('Forgot password clicked');
  }

  protected onRegister(): void {
    // TODO: Implementar navegação para registro
    console.log('Register clicked');
  }

  protected onRememberMeChange(event: any): void {
    // Sync all checkbox states
    const newValue = event?.checked || false;
    this.rememberMeModel = newValue;
    this.rememberMeValue.set(newValue);

    // Force form control update if needed
    if (this.loginForm.get('rememberMe')?.value !== newValue) {
      this.loginForm.get('rememberMe')?.setValue(newValue);
    }
  }
}
