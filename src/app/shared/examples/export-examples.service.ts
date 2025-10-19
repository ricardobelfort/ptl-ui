import { Injectable } from '@angular/core';
import { ExportOptions, ExportService } from '../../core/services/export.service';

/**
 * Exemplos de uso do ExportService
 * 
 * Este arquivo demonstra como usar o ExportService em diferentes cenários
 * através da aplicação para relatórios e auditorias
 */
@Injectable({
  providedIn: 'root'
})
export class ExportExamplesService {

  constructor(private exportService: ExportService) { }

  /**
   * Exemplo: Exportar dados de usuários
   */
  async exportUsers(users: any[]): Promise<void> {
    const options: ExportOptions = {
      filename: `usuarios-${new Date().toISOString().split('T')[0]}`,
      title: 'Relatório de Usuários',
      subtitle: 'Lista completa de usuários do sistema',
      columns: [
        { key: 'id', header: 'ID' },
        { key: 'nome', header: 'Nome' },
        { key: 'email', header: 'Email' },
        { key: 'perfil', header: 'Perfil' },
        { key: 'status', header: 'Status', formatter: (value: any) => value ? 'Ativo' : 'Inativo' },
        { key: 'createdAt', header: 'Data Criação', formatter: this.exportService.formatters.dateTime },
        { key: 'lastLogin', header: 'Último Acesso', formatter: this.exportService.formatters.dateTime }
      ],
      data: users
    };

    // Exportar para Excel
    await this.exportService.exportToExcel(options);

    // Ou exportar para PDF
    // await this.exportService.exportToPDF(options);
  }

  /**
   * Exemplo: Exportar dados financeiros
   */
  async exportFinancialData(transactions: any[]): Promise<void> {
    const options: ExportOptions = {
      filename: `relatorio-financeiro-${new Date().toISOString().split('T')[0]}`,
      title: 'Relatório Financeiro',
      subtitle: `Período: ${new Date().toLocaleDateString('pt-BR')}`,
      columns: [
        { key: 'id', header: 'ID' },
        { key: 'description', header: 'Descrição' },
        { key: 'amount', header: 'Valor', formatter: this.exportService.formatters.currency },
        { key: 'type', header: 'Tipo' },
        { key: 'date', header: 'Data', formatter: this.exportService.formatters.date },
        { key: 'status', header: 'Status' },
        { key: 'user.name', header: 'Usuário' } // Acesso a propriedade aninhada
      ],
      data: transactions
    };

    await this.exportService.exportToPDF(options);
  }

  /**
   * Exemplo: Exportar auditoria de ações
   */
  async exportAuditLog(auditLogs: any[]): Promise<void> {
    const options: ExportOptions = {
      filename: `auditoria-${new Date().toISOString().split('T')[0]}`,
      title: 'Log de Auditoria',
      subtitle: 'Registro de ações no sistema',
      columns: [
        { key: 'timestamp', header: 'Data/Hora', formatter: this.exportService.formatters.dateTime, width: 40 },
        { key: 'user', header: 'Usuário', width: 30 },
        { key: 'action', header: 'Ação', width: 25 },
        { key: 'resource', header: 'Recurso', width: 30 },
        { key: 'details', header: 'Detalhes', width: 50 },
        { key: 'ip', header: 'IP', width: 25 },
        { key: 'success', header: 'Sucesso', formatter: this.exportService.formatters.boolean, width: 20 }
      ],
      data: auditLogs
    };

    await this.exportService.exportToExcel(options);
  }

  /**
   * Exemplo: Formatador personalizado
   */
  private customStatusFormatter(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente',
      'blocked': 'Bloqueado'
    };
    return statusMap[status] || status;
  }

  /**
   * Exemplo: Exportar com formatação customizada
   */
  async exportWithCustomFormatting(data: any[]): Promise<void> {
    const options: ExportOptions = {
      filename: `dados-customizados-${Date.now()}`,
      title: 'Relatório Personalizado',
      columns: [
        { key: 'name', header: 'Nome' },
        { key: 'status', header: 'Status', formatter: this.customStatusFormatter },
        { key: 'value', header: 'Valor', formatter: (value: any) => `R$ ${value.toFixed(2)}` },
        { key: 'percentage', header: 'Percentual', formatter: (value: any) => `${(value * 100).toFixed(1)}%` }
      ],
      data: data
    };

    await this.exportService.exportToPDF(options);
  }
}