import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface ToastOptions {
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private messageService: MessageService) { }

  /**
   * Exibe uma notificação de sucesso
   */
  success(summary: string, detail?: string, options?: ToastOptions): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: options?.life ?? 5000,
      sticky: options?.sticky ?? false,
      closable: options?.closable ?? true
    });
  }

  /**
   * Exibe uma notificação de erro
   */
  error(summary: string, detail?: string, options?: ToastOptions): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: options?.life ?? 7000,
      sticky: options?.sticky ?? false,
      closable: options?.closable ?? true
    });
  }

  /**
   * Exibe uma notificação de aviso
   */
  warn(summary: string, detail?: string, options?: ToastOptions): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: options?.life ?? 6000,
      sticky: options?.sticky ?? false,
      closable: options?.closable ?? true
    });
  }

  /**
   * Exibe uma notificação informativa
   */
  info(summary: string, detail?: string, options?: ToastOptions): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: options?.life ?? 5000,
      sticky: options?.sticky ?? false,
      closable: options?.closable ?? true
    });
  }

  /**
   * Exibe uma notificação secundária
   */
  secondary(summary: string, detail?: string, options?: ToastOptions): void {
    this.messageService.add({
      severity: 'secondary',
      summary,
      detail,
      life: options?.life ?? 5000,
      sticky: options?.sticky ?? false,
      closable: options?.closable ?? true
    });
  }

  /**
   * Exibe uma notificação de contraste
   */
  contrast(summary: string, detail?: string, options?: ToastOptions): void {
    this.messageService.add({
      severity: 'contrast',
      summary,
      detail,
      life: options?.life ?? 5000,
      sticky: options?.sticky ?? false,
      closable: options?.closable ?? true
    });
  }

  /**
   * Limpa todas as notificações
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Limpa notificações por chave
   */
  clearByKey(key: string): void {
    this.messageService.clear(key);
  }

  /**
   * Exibe múltiplas notificações
   */
  showMultiple(messages: Array<{
    severity: 'success' | 'error' | 'warn' | 'info' | 'secondary' | 'contrast';
    summary: string;
    detail?: string;
    life?: number;
  }>): void {
    const formattedMessages = messages.map(msg => ({
      severity: msg.severity,
      summary: msg.summary,
      detail: msg.detail,
      life: msg.life ?? 5000
    }));

    this.messageService.addAll(formattedMessages);
  }

  /**
   * Métodos de conveniência para operações comuns
   */

  /**
   * Notificação de sucesso para operações CRUD
   */
  successOperation(operation: 'criado' | 'atualizado' | 'excluído' | 'salvo', item: string): void {
    this.success(
      'Operação realizada com sucesso',
      `${item} ${operation} com sucesso!`
    );
  }

  /**
   * Notificação de erro para operações CRUD
   */
  errorOperation(operation: 'criar' | 'atualizar' | 'excluir' | 'salvar' | 'carregar', item: string, error?: string): void {
    this.error(
      'Erro na operação',
      `Não foi possível ${operation} ${item}. ${error || 'Tente novamente.'}`
    );
  }

  /**
   * Notificação de validação
   */
  validationError(message: string = 'Verifique os campos obrigatórios'): void {
    this.warn(
      'Dados inválidos',
      message
    );
  }

  /**
   * Notificação de loading/carregamento
   */
  loading(message: string = 'Processando...', sticky: boolean = true): void {
    this.info(
      'Carregando',
      message,
      { sticky, closable: false }
    );
  }

  /**
   * Notificação de rede/conectividade
   */
  networkError(): void {
    this.error(
      'Erro de conectividade',
      'Verifique sua conexão com a internet e tente novamente.',
      { life: 8000 }
    );
  }

  /**
   * Notificação de acesso negado
   */
  accessDenied(): void {
    this.warn(
      'Acesso negado',
      'Você não tem permissão para realizar esta ação.'
    );
  }

  /**
   * Notificação de sessão expirada
   */
  sessionExpired(): void {
    this.warn(
      'Sessão expirada',
      'Sua sessão expirou. Faça login novamente.',
      { sticky: true }
    );
  }
}