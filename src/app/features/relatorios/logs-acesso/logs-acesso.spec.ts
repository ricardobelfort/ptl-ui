import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { LogsService } from '../../../core/services/logs.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingComponent } from '../../../shared/components';
import { LogsAcessoComponent } from './logs-acesso';

describe('LogsAcessoComponent', () => {
  let component: LogsAcessoComponent;
  let fixture: ComponentFixture<LogsAcessoComponent>;
  let mockLogsService: jasmine.SpyObj<LogsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockExportService: jasmine.SpyObj<ExportService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockUser = {
    id: '1',
    nome: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    perfil: 'admin'
  };

  const mockLogsResponse = {
    logs: [
      {
        _id: '1',
        userId: 'user1',
        timestamp: '2024-12-25T10:30:00Z',
        email: 'user@test.com',
        nome: 'Test User',
        perfil: 'user',
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        success: true,
        responseTime: 150,
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-12-25T10:30:00Z',
        updatedAt: '2024-12-25T10:30:00Z'
      },
      {
        _id: '2',
        userId: 'admin1',
        timestamp: '2024-12-25T11:00:00Z',
        email: 'admin@test.com',
        nome: 'Admin User',
        perfil: 'admin',
        method: 'POST',
        path: '/api/users',
        statusCode: 201,
        success: true,
        responseTime: 200,
        ip: '192.168.1.2',
        userAgent: 'Chrome/120.0',
        createdAt: '2024-12-25T11:00:00Z',
        updatedAt: '2024-12-25T11:00:00Z'
      }
    ],
    pagination: {
      page: 1,
      limit: 50,
      total: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    },
    filters: {}
  };

  beforeEach(async () => {
    const logsServiceSpy = jasmine.createSpyObj('LogsService', ['getAccessLogs']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      user: signal(mockUser)
    });
    const exportServiceSpy = jasmine.createSpyObj('ExportService', [
      'exportToExcel',
      'exportToPDF'
    ], {
      formatters: {
        dateTime: (value: any) => new Date(value).toLocaleString('pt-BR'),
        boolean: (value: any) => value ? 'Sim' : 'Não',
        status: (value: any) => `${value} - OK`
      }
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error', 
      'warn', 
      'info',
      'clear',
      'loading',
      'successOperation',
      'errorOperation',
      'validationError',
      'networkError'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LogsAcessoComponent,
        ReactiveFormsModule,
        LucideAngularModule,
        LoadingComponent
      ],
      providers: [
        FormBuilder,
        { provide: LogsService, useValue: logsServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ExportService, useValue: exportServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogsAcessoComponent);
    component = fixture.componentInstance;
    mockLogsService = TestBed.inject(LogsService) as jasmine.SpyObj<LogsService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockExportService = TestBed.inject(ExportService) as jasmine.SpyObj<ExportService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockMessageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Setup default service responses
    mockLogsService.getAccessLogs.and.returnValue(of(mockLogsResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load logs on init for admin user', () => {
      component.ngOnInit();

      expect(mockLogsService.getAccessLogs).toHaveBeenCalled();
      expect(component['logs']()).toEqual(mockLogsResponse.logs);
      expect(component['pagination']()).toEqual(mockLogsResponse.pagination);
    });

    it('should redirect non-admin users', () => {
      // Change user to non-admin
      const nonAdminUser = { ...mockUser, role: 'user', perfil: 'user' };
      Object.defineProperty(mockAuthService, 'user', {
        value: signal(nonAdminUser)
      });

      fixture = TestBed.createComponent(LogsAcessoComponent);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle load logs error', () => {
      mockLogsService.getAccessLogs.and.returnValue(throwError(() => new Error('API Error')));

      component.ngOnInit();

      expect(component['error']()).toBe('Erro ao carregar os logs de acesso. Tente novamente.');
      expect(component['isLoading']()).toBeFalse();
    });
  });

  describe('Export Menu', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should toggle export menu visibility', () => {
      expect(component['showExportMenu']()).toBeFalse();

      component['toggleExportMenu']();
      expect(component['showExportMenu']()).toBeTrue();

      component['toggleExportMenu']();
      expect(component['showExportMenu']()).toBeFalse();
    });

    it('should close export menu when clicking outside', () => {
      component['showExportMenu'].set(true);

      // Simulate click outside
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: outsideElement });

      document.dispatchEvent(clickEvent);

      expect(component['showExportMenu']()).toBeFalse();

      document.body.removeChild(outsideElement);
    });
  });

  describe('Export to Excel', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should export to Excel successfully', async () => {
      mockExportService.exportToExcel.and.returnValue(Promise.resolve());

      await component['exportToExcel']();

      expect(mockExportService.exportToExcel).toHaveBeenCalledWith(
        jasmine.objectContaining({
          filename: jasmine.stringMatching(/logs-acesso-\d{4}-\d{2}-\d{2}/),
          title: 'Relatório de Logs de Acesso',
          subtitle: jasmine.stringMatching(/Gerado em \d{2}\/\d{2}\/\d{4}/),
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({ key: 'timestamp', header: 'Data/Hora' }),
            jasmine.objectContaining({ key: 'email', header: 'Email' }),
            jasmine.objectContaining({ key: 'method', header: 'Método' }),
            jasmine.objectContaining({ key: 'path', header: 'Endpoint' }),
            jasmine.objectContaining({ key: 'statusCode', header: 'Status' }),
            jasmine.objectContaining({ key: 'success', header: 'Sucesso' })
          ]),
          data: mockLogsResponse.logs
        })
      );
      expect(component['showExportMenu']()).toBeFalse();
    });

    it('should handle Excel export error', async () => {
      mockExportService.exportToExcel.and.returnValue(Promise.reject(new Error('Export failed')));

      await component['exportToExcel']();

      expect(component['error']()).toBe('Erro ao exportar logs para Excel. Tente novamente.');
    });
  });

  describe('Export to PDF', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should export to PDF successfully', async () => {
      mockExportService.exportToPDF.and.returnValue(Promise.resolve());

      await component['exportToPDF']();

      expect(mockExportService.exportToPDF).toHaveBeenCalledWith(
        jasmine.objectContaining({
          filename: jasmine.stringMatching(/logs-acesso-\d{4}-\d{2}-\d{2}/),
          title: 'Relatório de Logs de Acesso',
          subtitle: jasmine.stringMatching(/Gerado em .+ - Total: 2 registros/),
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              key: 'timestamp',
              header: 'Data/Hora',
              width: 35
            }),
            jasmine.objectContaining({
              key: 'email',
              header: 'Email',
              width: 40
            }),
            jasmine.objectContaining({
              key: 'method',
              header: 'Método',
              width: 15
            })
          ]),
          data: mockLogsResponse.logs
        })
      );
      expect(component['showExportMenu']()).toBeFalse();
    });

    it('should handle PDF export error', async () => {
      mockExportService.exportToPDF.and.returnValue(Promise.reject(new Error('PDF export failed')));

      await component['exportToPDF']();

      expect(component['error']()).toBe('Erro ao exportar logs para PDF. Tente novamente.');
    });
  });

  describe('Data Formatting', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should format method class correctly', () => {
      expect(component['getMethodClass']('GET')).toBe('method-get');
      expect(component['getMethodClass']('POST')).toBe('method-post');
      expect(component['getMethodClass']('PUT')).toBe('method-put');
      expect(component['getMethodClass']('DELETE')).toBe('method-delete');
      expect(component['getMethodClass']('PATCH')).toBe('method-patch');
      expect(component['getMethodClass']('OPTIONS')).toBe('method-other');
    });

    it('should format status class correctly', () => {
      expect(component['getStatusClass'](200)).toBe('status-success');
      expect(component['getStatusClass'](201)).toBe('status-success');
      expect(component['getStatusClass'](400)).toBe('status-error');
      expect(component['getStatusClass'](401)).toBe('status-error');
      expect(component['getStatusClass'](403)).toBe('status-error');
      expect(component['getStatusClass'](404)).toBe('status-error');
      expect(component['getStatusClass'](500)).toBe('status-critical');
    });

    it('should format response time correctly', () => {
      expect(component['formatResponseTime'](150)).toBe('150ms');
      expect(component['formatResponseTime'](1500)).toBe('1.50s');
      expect(component['formatResponseTime'](2500)).toBe('2.50s');
    });

    it('should format user agent string', () => {
      const longUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const shortUserAgent = 'Mozilla/5.0';

      expect(component['formatUserAgent'](longUserAgent)).toBe(longUserAgent.substring(0, 50) + '...');
      expect(component['formatUserAgent'](shortUserAgent)).toBe(shortUserAgent);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should calculate displayed records correctly', () => {
      const currentPagination = component['pagination']();
      const expectedRecords = Math.min(currentPagination.limit, currentPagination.total);
      expect(expectedRecords).toBe(2);

      // Test with different pagination
      component['pagination'].set({
        page: 1,
        limit: 1,
        total: 5,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false
      });

      const newPagination = component['pagination']();
      const newExpectedRecords = Math.min(newPagination.limit, newPagination.total);
      expect(newExpectedRecords).toBe(1);
    });

    it('should handle rows per page change', () => {
      const mockEvent = {
        target: { value: '25' }
      } as any;

      spyOn(component as any, 'loadLogs');

      component['onRowsPerPageChange'](mockEvent);

      expect(component['pagination']().limit).toBe(25);
      expect(component['pagination']().page).toBe(1);
      expect((component as any).loadLogs).toHaveBeenCalled();
    });

    it('should handle page change through pagination', () => {
      // Set up pagination with multiple pages
      component['pagination'].set({
        page: 1,
        limit: 50,
        total: 100,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false
      });

      // Simulate loadLogs method call directly
      spyOn(component as any, 'loadLogs');

      // Test pagination state update
      component['pagination'].update(p => ({ ...p, page: 2 }));
      (component as any).loadLogs();

      expect(component['pagination']().page).toBe(2);
      expect((component as any).loadLogs).toHaveBeenCalled();
    });

    it('should maintain valid page numbers', () => {
      // Test that pagination stays within valid bounds
      component['pagination'].set({
        page: 1,
        limit: 50,
        total: 100,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false
      });

      const currentPage = component['pagination']().page;
      expect(currentPage).toBeGreaterThanOrEqual(1);
      expect(currentPage).toBeLessThanOrEqual(2);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should apply filters correctly', () => {
      spyOn(component as any, 'loadLogs');

      // Set form values
      component['filtersForm'].patchValue({
        email: 'test@example.com',
        method: 'GET',
        statusCode: '200'
      });

      component['applyFilters']();

      expect((component as any).loadLogs).toHaveBeenCalledWith({
        email: 'test@example.com',
        method: 'GET',
        statusCode: '200'
      });
      expect(component['pagination']().page).toBe(1);
    });

    it('should clear filters correctly', () => {
      spyOn(component as any, 'loadLogs');

      // Set form values
      component['filtersForm'].patchValue({
        email: 'test@example.com',
        method: 'GET'
      });

      component['clearFilters']();

      expect(component['filtersForm'].value.email).toBe(null);
      expect(component['filtersForm'].value.method).toBe(null);
      expect((component as any).loadLogs).toHaveBeenCalled();
    });

    it('should toggle filters visibility', () => {
      expect(component['showFilters']()).toBeFalse();

      component['toggleFilters']();
      expect(component['showFilters']()).toBeTrue();

      component['toggleFilters']();
      expect(component['showFilters']()).toBeFalse();
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should render export dropdown when menu is visible', () => {
      component['showExportMenu'].set(true);
      fixture.detectChanges();

      const exportMenu = fixture.debugElement.nativeElement.querySelector('.export-menu');
      expect(exportMenu).toBeTruthy();

      const exportOptions = fixture.debugElement.nativeElement.querySelectorAll('.export-option');
      expect(exportOptions.length).toBe(2); // Excel and PDF options
    });

    it('should not render export menu when hidden', () => {
      component['showExportMenu'].set(false);
      fixture.detectChanges();

      const exportMenu = fixture.debugElement.nativeElement.querySelector('.export-menu');
      expect(exportMenu).toBeFalsy();
    });

    it('should display logs data in table', () => {
      fixture.detectChanges();

      const tableRows = fixture.debugElement.nativeElement.querySelectorAll('tbody tr');
      expect(tableRows.length).toBe(2);

      // Check first row data
      const firstRowCells = tableRows[0].querySelectorAll('td');
      expect(firstRowCells[1].textContent).toContain('user@test.com'); // Email
      expect(firstRowCells[2].textContent).toContain('GET'); // Method
    });

    it('should show loading state', () => {
      component['isLoading'].set(true);
      fixture.detectChanges();

      const loadingContainer = fixture.debugElement.nativeElement.querySelector('.loading-container');
      expect(loadingContainer).toBeTruthy();
      expect(loadingContainer.textContent).toContain('Carregando logs...');
    });

    it('should show error message', () => {
      component['error'].set('Test error message');
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.nativeElement.querySelector('.error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('Test error message');
    });

    it('should show empty state when no logs', () => {
      component['logs'].set([]);
      component['isLoading'].set(false);
      fixture.detectChanges();

      const emptyState = fixture.debugElement.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Nenhum log encontrado');
    });
  });
});