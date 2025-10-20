import { Component, input } from '@angular/core';
import { Loader2, LoaderCircle, LucideAngularModule, RefreshCw } from 'lucide-angular';

export type LoadingType = 'spinner' | 'refresh' | 'circle' | 'dots';
export type LoadingSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="loading-container" 
         [class]="containerClass()"
         role="status" 
         aria-live="polite" 
         [attr.aria-label]="ariaLabel()">
      @switch (type()) {
        @case ('refresh') {
          <lucide-icon [img]="RefreshCw" [class]="iconClass() + ' animate-spin'"></lucide-icon>
        }
        @case ('circle') {
          <lucide-icon [img]="LoaderCircle" [class]="iconClass() + ' animate-spin'"></lucide-icon>
        }
        @case ('dots') {
          <div class="loading-dots" [class]="dotsClass()">
            <div></div>
            <div></div>
            <div></div>
          </div>
        }
        @default {
          <lucide-icon [img]="Loader2" [class]="iconClass() + ' animate-spin'"></lucide-icon>
        }
      }
      
      @if (message()) {
        <p class="loading-message" [class]="messageClass()">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem;
    }

    .loading-container.inline {
      flex-direction: row;
      padding: 1rem;
    }

    .loading-container.minimal {
      padding: 0.5rem;
      gap: 0.5rem;
    }

    .loading-container.fullscreen {
      min-height: 200px;
      padding: 3rem;
    }

    .loading-icon {
      color: var(--primary-600);
    }

    .loading-icon.sm {
      width: 1rem;
      height: 1rem;
    }

    .loading-icon.md {
      width: 1.5rem;
      height: 1.5rem;
    }

    .loading-icon.lg {
      width: 2rem;
      height: 2rem;
    }

    .loading-message {
      color: var(--gray-600);
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0;
      text-align: center;
    }

    .loading-message.sm {
      font-size: 0.75rem;
    }

    .loading-message.lg {
      font-size: 1rem;
    }

    .loading-dots {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .loading-dots div {
      width: 0.5rem;
      height: 0.5rem;
      background-color: var(--primary-600);
      border-radius: 50%;
      animation: loading-dots 1.4s infinite ease-in-out both;
    }

    .loading-dots.sm div {
      width: 0.375rem;
      height: 0.375rem;
    }

    .loading-dots.lg div {
      width: 0.625rem;
      height: 0.625rem;
    }

    .loading-dots div:nth-child(1) {
      animation-delay: -0.32s;
    }

    .loading-dots div:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes loading-dots {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Tema escuro */
    :root[data-theme="dark"] {
      .loading-icon {
        color: var(--primary-400);
      }

      .loading-message {
        color: var(--gray-300);
      }

      .loading-dots div {
        background-color: var(--primary-400);
      }
    }
  `]
})
export class LoadingComponent {
  // Inputs públicos usando a nova sintaxe de signals
  type = input<LoadingType>('spinner');
  size = input<LoadingSize>('md');
  message = input<string>('');
  inline = input<boolean>(false);
  minimal = input<boolean>(false);
  fullscreen = input<boolean>(false);

  // Ícones
  protected readonly RefreshCw = RefreshCw;
  protected readonly Loader2 = Loader2;
  protected readonly LoaderCircle = LoaderCircle;

  // Classes computadas
  protected containerClass() {
    const classes = [];
    if (this.inline()) classes.push('inline');
    if (this.minimal()) classes.push('minimal');
    if (this.fullscreen()) classes.push('fullscreen');
    return classes.join(' ');
  }

  protected iconClass() {
    return `loading-icon ${this.size()}`;
  }

  protected messageClass() {
    return `loading-message ${this.size()}`;
  }

  protected dotsClass() {
    return `loading-dots ${this.size()}`;
  }

  protected ariaLabel() {
    return this.message() || 'Carregando...';
  }
}