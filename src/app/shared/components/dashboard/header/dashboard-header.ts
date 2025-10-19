import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChevronDown, LogOut, LucideAngularModule, Settings, User } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeToggle } from '../../theme-toggle/theme-toggle';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ThemeToggle],
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
  protected readonly ChevronDown = ChevronDown;
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
}