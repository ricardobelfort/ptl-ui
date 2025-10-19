import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

export interface AccessLog {
  _id: string;
  userId: string;
  email: string;
  nome: string;
  perfil: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogsResponse {
  logs: AccessLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: Record<string, any>;
}

export interface LogsFilters {
  page?: number;
  limit?: number;
  userId?: string;
  email?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  ip?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/logs`;

  /**
   * Busca logs de acesso ao sistema
   */
  getAccessLogs(filters?: LogsFilters): Observable<LogsResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<LogsResponse>(`${this.baseUrl}/access`, { params });
  }

  /**
   * Busca estatísticas dos logs de acesso
   */
  getAccessStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/access/stats`);
  }

  /**
   * Exporta logs para CSV
   */
  exportLogs(filters?: LogsFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.baseUrl}/access/export`, {
      params,
      responseType: 'blob'
    });
  }
}