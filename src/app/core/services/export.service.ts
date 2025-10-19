import { Injectable } from '@angular/core';

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta dados para Excel (CSV)
   */
  async exportToExcel(options: ExportOptions): Promise<void> {
    try {
      const csvContent = this.generateCSV(options);
      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      this.downloadFile(blob, `${options.filename}.csv`);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      throw new Error('Falha ao exportar dados para Excel');
    }
  }

  /**
   * Exporta dados para PDF
   */
  async exportToPDF(options: ExportOptions): Promise<void> {
    try {
      // Import jsPDF e autoTable
      const jsPDFModule = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');

      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF('l', 'mm', 'a4');

      // Configuração do documento
      this.setupPDFDocument(doc, options);

      // Preparar dados para a tabela
      const tableData = this.prepareTableData(options);

      // Tentar múltiplas estratégias
      let success = false;

      // Estratégia 1: autoTable no prototype (versões antigas)
      if (typeof (doc as any).autoTable === 'function') {
        (doc as any).autoTable({
          head: [options.columns.map(col => col.header)],
          body: tableData,
          startY: options.title || options.subtitle ? 40 : 20,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 9, fontStyle: 'bold' },
          columnStyles: this.getColumnStyles(options.columns),
          margin: { top: 20, right: 10, bottom: 20, left: 10 },
          theme: 'striped',
          alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        success = true;
      }

      // Estratégia 2: autoTable como default export (versões novas)
      if (!success && autoTableModule.default && typeof autoTableModule.default === 'function') {
        autoTableModule.default(doc, {
          head: [options.columns.map(col => col.header)],
          body: tableData,
          startY: options.title || options.subtitle ? 40 : 20,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 9, fontStyle: 'bold' },
          columnStyles: this.getColumnStyles(options.columns),
          margin: { top: 20, right: 10, bottom: 20, left: 10 },
          theme: 'striped',
          alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        success = true;
      }

      // Estratégia 3: autoTable como módulo direto
      if (!success && typeof (autoTableModule as any) === 'function') {
        (autoTableModule as any)(doc, {
          head: [options.columns.map(col => col.header)],
          body: tableData,
          startY: options.title || options.subtitle ? 40 : 20,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 9, fontStyle: 'bold' },
          columnStyles: this.getColumnStyles(options.columns),
          margin: { top: 20, right: 10, bottom: 20, left: 10 },
          theme: 'striped',
          alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        success = true;
      }

      if (!success) {
        throw new Error('Nenhuma estratégia de autoTable funcionou');
      }

      // Adicionar rodapé
      this.addPDFFooter(doc);

      // Download
      doc.save(`${options.filename}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      throw new Error('Falha ao exportar dados para PDF');
    }
  }

  /**
   * Gera conteúdo CSV
   */
  private generateCSV(options: ExportOptions): string {
    const headers = options.columns.map(col => `"${col.header}"`).join(',');

    const rows = options.data.map(row => {
      return options.columns.map(col => {
        let value = this.getNestedValue(row, col.key);

        if (col.formatter) {
          value = col.formatter(value);
        }

        // Escapar aspas e quebras de linha
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
        }

        return `"${value || ''}"`;
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Configura o documento PDF
   */
  private setupPDFDocument(doc: any, options: ExportOptions): void {
    let yPosition = 20;

    if (options.title) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(options.title, 20, yPosition);
      yPosition += 10;
    }

    if (options.subtitle) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(options.subtitle, 20, yPosition);
      yPosition += 8;
    }

    // Data de geração
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit' });
    doc.text(`Gerado em: ${dateStr}`, 20, yPosition);
  }

  /**
   * Prepara dados para a tabela PDF
   */
  private prepareTableData(options: ExportOptions): string[][] {
    return options.data.map(row => {
      return options.columns.map(col => {
        let value = this.getNestedValue(row, col.key);

        if (col.formatter) {
          value = col.formatter(value);
        }

        return String(value || '');
      });
    });
  }

  /**
   * Obtém estilos das colunas para PDF
   */
  private getColumnStyles(columns: ExportColumn[]): any {
    const styles: any = {};

    columns.forEach((col, index) => {
      if (col.width) {
        styles[index] = { columnWidth: col.width };
      }
    });

    return styles;
  }

  /**
   * Adiciona rodapé ao PDF
   */
  private addPDFFooter(doc: any): void {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Linha do rodapé
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, pageHeight - 15, doc.internal.pageSize.width - 20, pageHeight - 15);

      // Número da página
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 30,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  /**
   * Obtém valor aninhado de um objeto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Faz download de um arquivo
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL object
    window.URL.revokeObjectURL(url);
  }

  /**
   * Formatadores comuns
   */
  public formatters = {
    date: (value: any) => {
      if (!value) return '';
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    },
    dateTime: (value: any) => {
      if (!value) return '';
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour12: false });
    },
    currency: (value: any) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0),
    number: (value: any) => new Intl.NumberFormat('pt-BR').format(value || 0),
    boolean: (value: any) => value ? 'Sim' : 'Não',
    status: (value: any) => {
      const statusMap: any = {
        200: '200 - OK',
        201: '201 - Created',
        400: '400 - Bad Request',
        401: '401 - Unauthorized',
        403: '403 - Forbidden',
        404: '404 - Not Found',
        500: '500 - Internal Error'
      };
      return statusMap[value] || value;
    }
  };
}