import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      (click)="toggleTheme()"
      class="theme-toggle-btn"
      [attr.aria-label]="isDarkMode() ? 'Ativar modo claro' : 'Ativar modo escuro'"
      [title]="isDarkMode() ? 'Modo claro' : 'Modo escuro'"
    >
      <div class="icon-container">
        @if (isDarkMode()) {
          <lucide-icon [img]="Sun" size="18" class="theme-icon"></lucide-icon>
        } @else {
          <lucide-icon [img]="Moon" size="18" class="theme-icon"></lucide-icon>
        }
      </div>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease-in-out;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-primary);
      color: var(--text-secondary);
      cursor: pointer;
    }

    .theme-toggle-btn:hover {
      background-color: var(--bg-accent);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
      transform: scale(1.05);
    }

    .theme-toggle-btn:active {
      box-shadow: none;
      transform: scale(0.95);
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease-in-out;
    }

    .theme-toggle-btn:hover .icon-container {
      transform: rotate(12deg);
    }

    .theme-icon {
      transition: all 0.2s ease;
    }

    /* Animação especial para o ícone do sol */
    .theme-toggle-btn:hover .theme-icon {
      filter: drop-shadow(0 0 6px var(--color-primary));
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule]
})
export class ThemeToggle {
  private readonly themeService = inject(ThemeService);

  // Ícones
  protected readonly Sun = Sun;
  protected readonly Moon = Moon;

  // Computed signals do serviço
  readonly isDarkMode = this.themeService.isDarkMode;

  /**
   * Alterna entre light e dark mode
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}