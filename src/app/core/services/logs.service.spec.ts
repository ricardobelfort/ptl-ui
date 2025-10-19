import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../config/environment';
import { AccessLog, LogsFilters, LogsResponse, LogsService } from './logs.service';

describe('LogsService', () => {
  let service: LogsService;
  let httpMock: HttpTestingController;

  const mockAccessLog: AccessLog = {
    _id: '1',
    userId: 'user1',
    email: 'test@example.com',
    nome: 'Test User',
    perfil: 'user',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    method: 'GET',
    path: '/api/test',
    statusCode: 200,
    responseTime: 150,
    success: true,
    timestamp: '2024-12-25T10:30:00Z',
    createdAt: '2024-12-25T10:30:00Z',
    updatedAt: '2024-12-25T10:30:00Z'
  };

  const mockLogsResponse: LogsResponse = {
    logs: [mockAccessLog],
    pagination: {
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    },
    filters: {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LogsService]
    });
    service = TestBed.inject(LogsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAccessLogs', () => {
    it('should fetch access logs without filters', () => {
      service.getAccessLogs().subscribe(response => {
        expect(response).toEqual(mockLogsResponse);
        expect(response.logs.length).toBe(1);
        expect(response.logs[0].email).toBe('test@example.com');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logs/access`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush(mockLogsResponse);
    });

    it('should fetch access logs with filters', () => {
      const filters: LogsFilters = {
        page: 2,
        limit: 25,
        email: 'test@example.com',
        method: 'GET',
        statusCode: 200,
        success: true,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        ip: '192.168.1.1'
      };

      service.getAccessLogs(filters).subscribe(response => {
        expect(response).toEqual(mockLogsResponse);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.apiUrl}/logs/access` &&
          request.params.get('page') === '2' &&
          request.params.get('limit') === '25' &&
          request.params.get('email') === 'test@example.com' &&
          request.params.get('method') === 'GET' &&
          request.params.get('statusCode') === '200' &&
          request.params.get('success') === 'true' &&
          request.params.get('startDate') === '2024-12-01' &&
          request.params.get('endDate') === '2024-12-31' &&
          request.params.get('ip') === '192.168.1.1';
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockLogsResponse);
    });

    it('should handle undefined and null filter values', () => {
      const filters: LogsFilters = {
        page: 1,
        limit: undefined,
        email: null as any,
        method: '',
        userId: undefined
      };

      service.getAccessLogs(filters).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.apiUrl}/logs/access` &&
          request.params.get('page') === '1' &&
          !request.params.has('limit') &&
          !request.params.has('email') &&
          !request.params.has('method') &&
          !request.params.has('userId');
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockLogsResponse);
    });

    it('should handle boolean filters correctly', () => {
      const filters: LogsFilters = {
        success: false
      };

      service.getAccessLogs(filters).subscribe(response => {
        expect(response).toEqual(mockLogsResponse);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.apiUrl}/logs/access` &&
          request.params.get('success') === 'false';
      });
      req.flush(mockLogsResponse);
    });

    it('should handle number filters correctly', () => {
      const filters: LogsFilters = {
        statusCode: 404
      };

      service.getAccessLogs(filters).subscribe(response => {
        expect(response).toEqual(mockLogsResponse);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.apiUrl}/logs/access` &&
          request.params.get('statusCode') === '404';
      });
      req.flush(mockLogsResponse);
    });
  });

  describe('exportLogs', () => {
    it('should export logs without filters', () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.exportLogs().subscribe(blob => {
        expect(blob).toEqual(mockBlob);
        expect(blob.type).toBe('text/csv');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logs/access/export`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      expect(req.request.params.keys()).toEqual([]);
      req.flush(mockBlob);
    });

    it('should export logs with filters', () => {
      const filters: LogsFilters = {
        email: 'test@example.com',
        method: 'POST',
        startDate: '2024-12-01',
        endDate: '2024-12-31'
      };
      const mockBlob = new Blob(['filtered csv data'], { type: 'text/csv' });

      service.exportLogs(filters).subscribe(blob => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.apiUrl}/logs/access/export` &&
          request.params.get('email') === 'test@example.com' &&
          request.params.get('method') === 'POST' &&
          request.params.get('startDate') === '2024-12-01' &&
          request.params.get('endDate') === '2024-12-31';
      });
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should handle empty filters in export', () => {
      const filters: LogsFilters = {
        email: '',
        method: undefined,
        success: null as any
      };
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.exportLogs(filters).subscribe(blob => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.apiUrl}/logs/access/export` &&
          !request.params.has('email') &&
          !request.params.has('method') &&
          !request.params.has('success');
      });
      req.flush(mockBlob);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors in getAccessLogs', () => {
      service.getAccessLogs().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logs/access`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle HTTP errors in exportLogs', () => {
      service.exportLogs().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe('Forbidden');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logs/access/export`);
      const mockErrorResponse = new ErrorEvent('Network Error');
      req.error(mockErrorResponse, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle network errors', () => {
      service.getAccessLogs().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logs/access`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('Private Methods', () => {
    it('should build HTTP params correctly with mixed filter types', () => {
      const filters: LogsFilters = {
        page: 1,
        limit: 50,
        email: 'test@example.com',
        method: 'GET',
        statusCode: 200,
        success: true,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        ip: '192.168.1.1',
        userId: 'user123'
      };

      service.getAccessLogs(filters).subscribe(response => {
        expect(response).toEqual(mockLogsResponse);
      });

      const req = httpMock.expectOne((request) => {
        const params = request.params;
        return params.get('page') === '1' &&
          params.get('limit') === '50' &&
          params.get('email') === 'test@example.com' &&
          params.get('method') === 'GET' &&
          params.get('statusCode') === '200' &&
          params.get('success') === 'true' &&
          params.get('startDate') === '2024-12-01' &&
          params.get('endDate') === '2024-12-31' &&
          params.get('ip') === '192.168.1.1' &&
          params.get('userId') === 'user123';
      });
      req.flush(mockLogsResponse);
    });
  });

  describe('Response Validation', () => {
    it('should handle empty logs response', () => {
      const emptyResponse: LogsResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: {}
      };

      service.getAccessLogs().subscribe(response => {
        expect(response.logs.length).toBe(0);
        expect(response.pagination.total).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logs/access`);
      req.flush(emptyResponse);
    });

    it('should handle multiple logs in response', () => {
      const multipleLogsResponse: LogsResponse = {
        logs: [
          { ...mockAccessLog, _id: '1' },
          { ...mockAccessLog, _id: '2', email: 'user2@example.com' },
          { ...mockAccessLog, _id: '3', method: 'POST' }
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: {}
      };

      service.getAccessLogs().subscribe(response => {
        expect(response.logs.length).toBe(3);
        expect(response.logs[1].email).toBe('user2@example.com');
        expect(response.logs[2].method).toBe('POST');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/logs/access`);
      req.flush(multipleLogsResponse);
    });
  });
});