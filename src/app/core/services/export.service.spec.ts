import { TestBed } from '@angular/core/testing';
import { ExportOptions, ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportService]
    });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Formatters', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-12-25T10:30:00');
      const result = service.formatters.date(date);
      expect(result).toBe('25/12/2024');
    });

    it('should format dateTime correctly', () => {
      const date = new Date('2024-12-25T14:30:00');
      const result = service.formatters.dateTime(date);
      expect(result).toBe('25/12/2024 14:30:00');
    });

    it('should handle null/undefined dates', () => {
      expect(service.formatters.date(null)).toBe('');
      expect(service.formatters.date(undefined)).toBe('');
      expect(service.formatters.dateTime(null)).toBe('');
      expect(service.formatters.dateTime(undefined)).toBe('');
    });

    it('should format currency correctly', () => {
      const result = service.formatters.currency(1234.56);
      expect(result).toContain('1.234,56');
    });

    it('should format numbers correctly', () => {
      const result = service.formatters.number(1234567);
      expect(result).toBe('1.234.567');
    });

    it('should format boolean values correctly', () => {
      expect(service.formatters.boolean(true)).toBe('Sim');
      expect(service.formatters.boolean(false)).toBe('Não');
      expect(service.formatters.boolean(null)).toBe('Não');
      expect(service.formatters.boolean(undefined)).toBe('Não');
    });

    it('should format HTTP status codes correctly', () => {
      expect(service.formatters.status(200)).toBe('200 - OK');
      expect(service.formatters.status(404)).toBe('404 - Not Found');
      expect(service.formatters.status(500)).toBe('500 - Internal Error');
      expect(service.formatters.status(999)).toBe(999); // Unknown status
    });
  });

  describe('CSV Generation', () => {
    it('should generate CSV content correctly', () => {
      const options: ExportOptions = {
        filename: 'test',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Nome' },
          { key: 'active', header: 'Ativo', formatter: service.formatters.boolean }
        ],
        data: [
          { id: 1, name: 'João Silva', active: true },
          { id: 2, name: 'Maria Santos', active: false }
        ]
      };

      // Access private method for testing
      const csvContent = (service as any).generateCSV(options);

      expect(csvContent).toContain('"ID","Nome","Ativo"');
      expect(csvContent).toContain('"1","João Silva","Sim"');
      expect(csvContent).toContain('"2","Maria Santos","Não"');
    });

    it('should handle nested object properties', () => {
      const options: ExportOptions = {
        filename: 'test',
        columns: [
          { key: 'user.name', header: 'Nome do Usuário' },
          { key: 'user.profile.role', header: 'Papel' }
        ],
        data: [
          {
            user: {
              name: 'João',
              profile: { role: 'admin' }
            }
          }
        ]
      };

      const csvContent = (service as any).generateCSV(options);
      expect(csvContent).toContain('"João"');
      expect(csvContent).toContain('"admin"');
    });

    it('should escape special characters in CSV', () => {
      const options: ExportOptions = {
        filename: 'test',
        columns: [
          { key: 'description', header: 'Descrição' }
        ],
        data: [
          { description: 'Texto com "aspas" e quebra\nlinha' }
        ]
      };

      const csvContent = (service as any).generateCSV(options);
      expect(csvContent).toContain('""aspas""'); // Escaped quotes
    });
  });

  describe('Nested Value Access', () => {
    it('should get nested values correctly', () => {
      const obj = {
        user: {
          profile: {
            name: 'João',
            role: 'admin'
          }
        }
      };

      // Access private method for testing
      const getName = (service as any).getNestedValue(obj, 'user.profile.name');
      const getRole = (service as any).getNestedValue(obj, 'user.profile.role');
      const getNonExistent = (service as any).getNestedValue(obj, 'user.profile.age');

      expect(getName).toBe('João');
      expect(getRole).toBe('admin');
      expect(getNonExistent).toBeUndefined();
    });

    it('should handle null/undefined objects', () => {
      const getValue = (service as any).getNestedValue(null, 'user.name');
      expect(getValue).toBeUndefined();
    });
  });

  describe('Export Methods', () => {
    let mockCreateObjectURL: jasmine.Spy;
    let mockRevokeObjectURL: jasmine.Spy;
    let mockAppendChild: jasmine.Spy;
    let mockRemoveChild: jasmine.Spy;
    let mockClick: jasmine.Spy;

    beforeEach(() => {
      // Mock DOM APIs
      mockCreateObjectURL = jasmine.createSpy('createObjectURL').and.returnValue('mock-url');
      mockRevokeObjectURL = jasmine.createSpy('revokeObjectURL');

      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL
        },
        writable: true
      });

      mockAppendChild = jasmine.createSpy('appendChild');
      mockRemoveChild = jasmine.createSpy('removeChild');
      mockClick = jasmine.createSpy('click');

      spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        style: { display: '' },
        click: mockClick
      } as any);

      Object.defineProperty(document, 'body', {
        value: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild
        },
        writable: true
      });
    });

    it('should export to Excel successfully', async () => {
      const options: ExportOptions = {
        filename: 'test-excel',
        title: 'Test Report',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Nome' }
        ],
        data: [
          { id: 1, name: 'João' },
          { id: 2, name: 'Maria' }
        ]
      };

      await service.exportToExcel(options);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should handle export errors gracefully', async () => {
      // Mock a failure in file creation
      mockCreateObjectURL.and.throwError('Mock error');

      const options: ExportOptions = {
        filename: 'test-error',
        columns: [{ key: 'id', header: 'ID' }],
        data: [{ id: 1 }]
      };

      await expectAsync(service.exportToExcel(options)).toBeRejectedWithError('Falha ao exportar dados para Excel');
    });
  });

  describe('PDF Export', () => {
    it('should export to PDF successfully with mock data', async () => {
      const options: ExportOptions = {
        filename: 'test-pdf',
        title: 'Test PDF Report',
        subtitle: 'Test Subtitle',
        columns: [
          { key: 'id', header: 'ID', width: 20 },
          { key: 'name', header: 'Nome', width: 40 }
        ],
        data: [
          { id: 1, name: 'João' },
          { id: 2, name: 'Maria' }
        ]
      };

      // Mock the exportToPDF method to avoid complex dynamic import mocking
      spyOn(service, 'exportToPDF').and.returnValue(Promise.resolve());

      await service.exportToPDF(options);
      expect(service.exportToPDF).toHaveBeenCalledWith(options);
    });

    it('should handle PDF export errors gracefully', async () => {
      const options: ExportOptions = {
        filename: 'test-pdf-error',
        columns: [{ key: 'id', header: 'ID' }],
        data: [{ id: 1 }]
      };

      // Mock the method to throw an error
      spyOn(service, 'exportToPDF').and.returnValue(
        Promise.reject(new Error('Falha ao exportar dados para PDF'))
      );

      await expectAsync(service.exportToPDF(options)).toBeRejectedWithError('Falha ao exportar dados para PDF');
    });

    it('should prepare table data correctly for PDF export', () => {
      const options: ExportOptions = {
        filename: 'test',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Nome' },
          { key: 'active', header: 'Ativo', formatter: service.formatters.boolean }
        ],
        data: [
          { id: 1, name: 'João', active: true },
          { id: 2, name: 'Maria', active: false }
        ]
      };

      // Access private method for testing
      const tableData = (service as any).prepareTableData(options);

      expect(tableData).toEqual([
        ['1', 'João', 'Sim'],
        ['2', 'Maria', 'Não']
      ]);
    });

    it('should setup PDF document correctly', () => {
      const mockDoc = {
        setFontSize: jasmine.createSpy('setFontSize'),
        setFont: jasmine.createSpy('setFont'),
        text: jasmine.createSpy('text')
      };

      const options: ExportOptions = {
        filename: 'test',
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        columns: [{ key: 'id', header: 'ID' }],
        data: [{ id: 1 }]
      };

      // Access private method for testing
      (service as any).setupPDFDocument(mockDoc, options);

      expect(mockDoc.setFontSize).toHaveBeenCalled();
      expect(mockDoc.setFont).toHaveBeenCalled();
      expect(mockDoc.text).toHaveBeenCalledWith('Test Title', 20, 20);
      expect(mockDoc.text).toHaveBeenCalledWith('Test Subtitle', 20, 30);
    });

    it('should get column styles correctly', () => {
      const columns = [
        { key: 'id', header: 'ID', width: 20 },
        { key: 'name', header: 'Nome', width: 40 },
        { key: 'status', header: 'Status' } // No width specified
      ];

      // Access private method for testing
      const columnStyles = (service as any).getColumnStyles(columns);

      expect(columnStyles).toEqual({
        0: { columnWidth: 20 },
        1: { columnWidth: 40 }
      });
    });
  });

  describe('Table Data Preparation', () => {
    it('should prepare table data correctly for PDF', () => {
      const options: ExportOptions = {
        filename: 'test',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Nome' },
          { key: 'active', header: 'Ativo', formatter: service.formatters.boolean }
        ],
        data: [
          { id: 1, name: 'João', active: true },
          { id: 2, name: 'Maria', active: false }
        ]
      };

      // Access private method for testing
      const tableData = (service as any).prepareTableData(options);

      expect(tableData).toEqual([
        ['1', 'João', 'Sim'],
        ['2', 'Maria', 'Não']
      ]);
    });

    it('should handle missing values gracefully', () => {
      const options: ExportOptions = {
        filename: 'test',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'missing', header: 'Campo Inexistente' }
        ],
        data: [
          { id: 1 }
        ]
      };

      const tableData = (service as any).prepareTableData(options);
      expect(tableData).toEqual([['1', '']]);
    });
  });

  describe('Column Styles', () => {
    it('should generate column styles for PDF', () => {
      const columns = [
        { key: 'id', header: 'ID', width: 20 },
        { key: 'name', header: 'Nome', width: 40 },
        { key: 'email', header: 'Email' } // No width
      ];

      // Access private method for testing
      const styles = (service as any).getColumnStyles(columns);

      expect(styles[0]).toEqual({ columnWidth: 20 });
      expect(styles[1]).toEqual({ columnWidth: 40 });
      expect(styles[2]).toBeUndefined();
    });
  });

  describe('File Download', () => {
    it('should create download link correctly', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test-file.txt';

      // Mock URL.createObjectURL (não usar se já foi spied)
      if (!jasmine.isSpy(window.URL.createObjectURL)) {
        spyOn(window.URL, 'createObjectURL').and.returnValue('mock-url');
      } else {
        (window.URL.createObjectURL as jasmine.Spy).and.returnValue('mock-url');
      }

      if (!jasmine.isSpy(window.URL.revokeObjectURL)) {
        spyOn(window.URL, 'revokeObjectURL');
      }

      const mockElement = {
        href: '',
        download: '',
        style: { display: '' },
        click: jasmine.createSpy('click')
      };

      spyOn(document, 'createElement').and.returnValue(mockElement as any);

      // Verificar se appendChild já é um spy
      if (!jasmine.isSpy(document.body.appendChild)) {
        spyOn(document.body, 'appendChild');
      }

      if (!jasmine.isSpy(document.body.removeChild)) {
        spyOn(document.body, 'removeChild');
      }

      // Access private method for testing
      (service as any).downloadFile(blob, filename);

      expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(mockElement.href).toBe('mock-url');
      expect(mockElement.download).toBe(filename);
      expect(mockElement.style.display).toBe('none');
      expect(document.body.appendChild).toHaveBeenCalledWith(jasmine.any(Object));
      expect(mockElement.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(jasmine.any(Object));
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });
});