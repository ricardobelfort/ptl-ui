import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  LucideAngularModule,
  Monitor,
  RefreshCw,
  Search,
  Shield,
  User
} from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { AccessLog, LogsFilters, LogsResponse, LogsService } from '../../../core/services/logs.service';

@Component({
  selector: 'app-logs-acesso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, DatePipe],
  templateUrl: './logs-acesso.html',
  styleUrls: ['./logs-acesso.css']
})
export class LogsAcessoComponent implements OnInit {
  private readonly logsService = inject(LogsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly exportService = inject(ExportService);

  // Lucide Icons
  protected readonly Activity = Activity;
  protected readonly Calendar = Calendar;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;
  protected readonly Clock = Clock;
  protected readonly Download = Download;
  protected readonly FileText = FileText;
  protected readonly Filter = Filter;
  protected readonly Monitor = Monitor;
  protected readonly RefreshCw = RefreshCw;
  protected readonly Search = Search;
  protected readonly Shield = Shield;
  protected readonly User = User;

  // Estado do componente
  protected readonly logs = signal<AccessLog[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pagination = signal({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filtros
  protected readonly showFilters = signal(false);
  protected readonly showExportMenu = signal(false);
  protected readonly filtersForm: FormGroup;

  // Computed
  protected readonly currentUser = this.authService.user;
  protected readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    // Inicializar formulário de filtros
    this.filtersForm = this.fb.group({
      email: [''],
      method: [''],
      path: [''],
      statusCode: [''],
      success: [''],
      startDate: [''],
      endDate: [''],
      ip: ['']
    });

    // Configurar debounce para os filtros
    this.filtersForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    // Verificar se é admin
    if (!this.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Configurar observação de mudanças no formulário
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Fechar menu de exportação ao clicar fora
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const exportDropdown = document.querySelector('.export-dropdown');

      if (exportDropdown && !exportDropdown.contains(target)) {
        this.showExportMenu.set(false);
      }
    });

    this.loadLogs();
  }

  /**
   * Carrega os logs de acesso
   */
  protected loadLogs(filters?: LogsFilters): void {
    this.isLoading.set(true);
    this.error.set(null);

    const currentFilters = {
      page: this.pagination().page,
      limit: this.pagination().limit,
      ...filters
    };

    this.logsService.getAccessLogs(currentFilters).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: LogsResponse) => {
        this.logs.set(response.logs);
        this.pagination.set(response.pagination);
      },
      error: (err) => {
        console.error('Erro ao carregar logs:', err);
        this.error.set('Erro ao carregar os logs de acesso. Tente novamente.');
      }
    });
  }

  /**
   * Aplica os filtros do formulário
   */
  protected applyFilters(): void {
    const filters = this.filtersForm.value;
    // Remove campos vazios
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadLogs(cleanFilters);
  }

  /**
   * Limpa todos os filtros
   */
  protected clearFilters(): void {
    this.filtersForm.reset();
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadLogs();
  }

  /**
   * Navega para a próxima página
   */
  protected nextPage(): void {
    if (this.pagination().hasNextPage) {
      this.pagination.update(p => ({ ...p, page: p.page + 1 }));
      this.loadLogs(this.filtersForm.value);
    }
  }

  /**
   * Navega para a página anterior
   */
  protected prevPage(): void {
    if (this.pagination().hasPrevPage) {
      this.pagination.update(p => ({ ...p, page: p.page - 1 }));
      this.loadLogs(this.filtersForm.value);
    }
  }

  /**
   * Atualiza a lista
   */
  protected refresh(): void {
    this.loadLogs(this.filtersForm.value);
  }

  /**
   * Alterna visibilidade do menu de exportação
   */
  protected toggleExportMenu(): void {
    this.showExportMenu.update(show => !show);
  }

  /**
   * Exporta os logs para Excel
   */
  protected async exportToExcel(): Promise<void> {
    try {
      const exportData = {
        filename: `logs-acesso-${new Date().toISOString().split('T')[0]}`,
        title: 'Relatório de Logs de Acesso',
        subtitle: `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        columns: [
          { key: 'timestamp', header: 'Data/Hora', formatter: this.exportService.formatters.dateTime },
          { key: 'email', header: 'Email' },
          { key: 'nome', header: 'Nome' },
          { key: 'perfil', header: 'Perfil' },
          { key: 'method', header: 'Método' },
          { key: 'path', header: 'Endpoint' },
          { key: 'statusCode', header: 'Status', formatter: this.exportService.formatters.status },
          { key: 'success', header: 'Sucesso', formatter: this.exportService.formatters.boolean },
          { key: 'responseTime', header: 'Tempo (ms)' },
          { key: 'ip', header: 'IP' },
          { key: 'userAgent', header: 'User Agent' }
        ],
        data: this.logs()
      };

      await this.exportService.exportToExcel(exportData);
      this.showExportMenu.set(false);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      this.error.set('Erro ao exportar logs para Excel. Tente novamente.');
    }
  }

  /**
   * Exporta os logs para PDF
   */
  protected async exportToPDF(): Promise<void> {
    try {
      const exportData = {
        filename: `logs-acesso-${new Date().toISOString().split('T')[0]}`,
        title: 'Relatório de Logs de Acesso',
        subtitle: `Gerado em ${new Date().toLocaleDateString('pt-BR')} - Total: ${this.logs().length} registros`,
        columns: [
          { key: 'timestamp', header: 'Data/Hora', formatter: this.exportService.formatters.dateTime, width: 35 },
          { key: 'email', header: 'Email', width: 40 },
          { key: 'perfil', header: 'Perfil', width: 20 },
          { key: 'method', header: 'Método', width: 15 },
          { key: 'path', header: 'Endpoint', width: 40 },
          { key: 'statusCode', header: 'Status', width: 15 },
          { key: 'success', header: 'Sucesso', formatter: this.exportService.formatters.boolean, width: 15 },
          { key: 'responseTime', header: 'Tempo (ms)', width: 20 },
          { key: 'ip', header: 'IP', width: 25 }
        ],
        data: this.logs()
      };

      await this.exportService.exportToPDF(exportData);
      this.showExportMenu.set(false);
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      this.error.set('Erro ao exportar logs para PDF. Tente novamente.');
    }
  }

  /**
   * Retorna a classe CSS para o status code
   */
  protected getStatusClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 300 && statusCode < 400) return 'status-warning';
    if (statusCode >= 400 && statusCode < 500) return 'status-error';
    if (statusCode >= 500) return 'status-critical';
    return '';
  }

  /**
   * Retorna a classe CSS para o método HTTP
   */
  protected getMethodClass(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET': return 'method-get';
      case 'POST': return 'method-post';
      case 'PUT': return 'method-put';
      case 'DELETE': return 'method-delete';
      case 'PATCH': return 'method-patch';
      default: return 'method-other';
    }
  }

  /**
   * Formata o tempo de resposta
   */
  protected formatResponseTime(time: number): string {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  }

  /**
   * Formata o User Agent para exibição
   */
  protected formatUserAgent(userAgent: string): string {
    if (userAgent.length > 50) {
      return userAgent.substring(0, 50) + '...';
    }
    return userAgent;
  }

  /**
   * Alterna a visibilidade dos filtros
   */
  protected toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  /**
   * Calcula o número de registros exibidos
   */
  protected getDisplayedRecords(): number {
    const p = this.pagination();
    return Math.min(p.page * p.limit, p.total);
  }

  /**
   * Altera o número de linhas por página
   */
  protected onRowsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value, 10);

    this.pagination.update(p => ({
      ...p,
      limit: newLimit,
      page: 1
    }));

    this.loadLogs(this.filtersForm.value);
  }

  /**
   * Navega para uma página específica
   */
  protected onPageChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newPage = parseInt(target.value, 10);

    if (newPage >= 1 && newPage <= this.pagination().totalPages) {
      this.pagination.update(p => ({ ...p, page: newPage }));
      this.loadLogs(this.filtersForm.value);
    }
  }
}