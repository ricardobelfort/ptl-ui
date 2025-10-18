import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  Activity,
  BarChart3,
  Clock,
  LucideAngularModule,
  Settings,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly authService = inject(AuthService);

  // Lucide icons
  protected readonly Users = Users;
  protected readonly UserPlus = UserPlus;
  protected readonly BarChart3 = BarChart3;
  protected readonly Settings = Settings;
  protected readonly Clock = Clock;
  protected readonly TrendingUp = TrendingUp;
  protected readonly Activity = Activity;

  protected readonly user = this.authService.user;
  protected readonly currentTime = computed(() => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    const userName = this.user()?.name || 'Usuário';

    if (hour < 12) {
      return `Bom dia, ${userName}!`;
    } else if (hour < 18) {
      return `Boa tarde, ${userName}!`;
    } else {
      return `Boa noite, ${userName}!`;
    }
  });
}
