import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ptl-theme';

  // Signal para o tema atual
  private readonly _currentTheme = signal<Theme>(this.getInitialTheme());

  // Signal público readonly
  readonly currentTheme = this._currentTheme.asReadonly();

  // Computed para verificar se é dark mode
  readonly isDarkMode = () => this._currentTheme() === 'dark';

  constructor() {
    // Effect para aplicar o tema automaticamente quando muda
    effect(() => {
      this.applyTheme(this._currentTheme());
    });
  }

  /**
   * Obtém o tema inicial (localStorage ou preferência do sistema)
   */
  private getInitialTheme(): Theme {
    // Primeiro verifica o localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    // Se não há tema salvo, verifica preferência do sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Fallback para light
    return 'light';
  }

  /**
   * Aplica o tema ao documento
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;

    // Remove classes anteriores e adiciona nova
    html.classList.remove('light', 'dark');
    html.classList.add(theme);

    // Salva no localStorage
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Alterna entre light e dark mode
   */
  toggleTheme(): void {
    const newTheme: Theme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this._currentTheme.set(newTheme);
  }

  /**
   * Define um tema específico
   */
  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
  }
}