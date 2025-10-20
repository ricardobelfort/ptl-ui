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
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

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

  /**
   * Métodos de demonstração das notificações Toast
   */
  protected showSuccessToast(): void {
    this.notificationService.success(
      'Operação realizada com sucesso!',
      'Seus dados foram salvos corretamente.'
    );
  }

  protected showErrorToast(): void {
    this.notificationService.error(
      'Erro na operação',
      'Algo deu errado. Tente novamente.'
    );
  }

  protected showWarningToast(): void {
    this.notificationService.warn(
      'Atenção necessária',
      'Verifique os dados antes de continuar.'
    );
  }

  protected showInfoToast(): void {
    this.notificationService.info(
      'Informação importante',
      'Nova atualização disponível no sistema.'
    );
  }

  protected showMultipleToasts(): void {
    this.notificationService.showMultiple([
      { severity: 'success', summary: 'Sucesso', detail: 'Primeiro item processado' },
      { severity: 'info', summary: 'Info', detail: 'Segundo item em processamento' },
      { severity: 'warn', summary: 'Aviso', detail: 'Terceiro item precisa de atenção' }
    ]);
  }

  /**
   * Action handlers for quick action cards
   */
  protected onNewIntern(): void {
    // TODO: Navigate to new intern form
    console.log('Navigate to new intern form');
  }

  protected onReports(): void {
    // TODO: Navigate to reports
    console.log('Navigate to reports');
  }

  protected onEditData(): void {
    // TODO: Navigate to edit data
    console.log('Navigate to edit data');
  }

  protected onSettings(): void {
    // TODO: Navigate to settings
    console.log('Navigate to settings');
  }
}
