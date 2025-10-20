import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LogOut, LucideAngularModule, Settings, User } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../theme-toggle/theme-toggle';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ThemeToggleComponent, ButtonModule],
  templateUrl: './dashboard-header.html',
  styleUrls: ['./dashboard-header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeader {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.user;
  protected readonly isMenuOpen = signal(false);

  // Lucide icons
  protected readonly User = User;
  protected readonly Settings = Settings;
  protected readonly LogOut = LogOut;

  protected toggleUserMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even on error, navigate to login
        this.router.navigate(['/login']);
      }
    });
  }

  protected onProfile(): void {
    this.isMenuOpen.set(false);
    // TODO: Navigate to profile page
    console.log('Navigate to profile');
  }

  protected onSettings(): void {
    this.isMenuOpen.set(false);
    // TODO: Navigate to settings page
    console.log('Navigate to settings');
  }

  // Métodos de teste para refresh token - APENAS para desenvolvimento
  protected testTokenInfo(): void {
    const info = (this.authService as any).getTokenInfo();
    console.log('🔍 Token Info:', info);
  }

  protected testShortExpiry(): void {
    (this.authService as any).setShortExpiryForTesting();
    console.log('⏰ Token expiry set to 2 minutes for testing');
  }

  protected testRefreshNow(): void {
    console.log('🔄 Manual token refresh test...');
    (this.authService as any).checkAndRefreshToken().subscribe({
      next: () => console.log('✅ Manual refresh successful'),
      error: (err: any) => console.error('❌ Manual refresh failed:', err)
    });
  }
}