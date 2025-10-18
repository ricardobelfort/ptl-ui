import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiError, LoginRequest } from '../../../core/interfaces/auth.interface';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

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
}
