# Export Service - Documentação

O `ExportService` é um serviço global para exportação de dados em PDF e Excel (CSV) que pode ser usado em toda a aplicação para relatórios e auditorias.

## Instalação

As dependências necessárias já estão instaladas:
- `jspdf` - Para geração de PDFs
- `jspdf-autotable` - Para tabelas em PDF
- `@types/jspdf` - Tipos TypeScript

## Uso Básico

### 1. Injeção do Serviço

```typescript
import { Component, inject } from '@angular/core';
import { ExportService } from '../../core/services/export.service';

@Component({...})
export class MyComponent {
  private readonly exportService = inject(ExportService);
}
```

### 2. Configuração dos Dados

```typescript
const exportOptions = {
  filename: 'meu-relatorio',
  title: 'Relatório de Dados',
  subtitle: 'Descrição opcional do relatório',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'Email' },
    { key: 'createdAt', header: 'Data Criação', formatter: this.exportService.formatters.dateTime }
  ],
  data: this.myData
};
```

### 3. Exportação

```typescript
// Para Excel (CSV)
await this.exportService.exportToExcel(exportOptions);

// Para PDF
await this.exportService.exportToPDF(exportOptions);
```

## Interface ExportOptions

```typescript
interface ExportOptions {
  filename: string;          // Nome do arquivo (sem extensão)
  title?: string;           // Título do documento (opcional)
  subtitle?: string;        // Subtítulo do documento (opcional)
  columns: ExportColumn[];  // Configuração das colunas
  data: any[];             // Dados para exportar
}
```

## Interface ExportColumn

```typescript
interface ExportColumn {
  key: string;                           // Chave do campo nos dados
  header: string;                        // Cabeçalho da coluna
  formatter?: (value: any) => string;    // Formatador opcional
  width?: number;                        // Largura da coluna (apenas PDF)
}
```

## Formatadores Disponíveis

O serviço inclui formatadores pré-definidos:

```typescript
this.exportService.formatters = {
  date: (value) => '25/12/2024',
  dateTime: (value) => '25/12/2024 14:30:00',
  currency: (value) => 'R$ 1.234,56',
  number: (value) => '1.234',
  boolean: (value) => 'Sim' | 'Não',
  status: (value) => '200 - OK'
};
```

## Exemplos Práticos

### Exemplo 1: Exportar Lista de Usuários

```typescript
async exportUsers(): Promise<void> {
  const options = {
    filename: `usuarios-${new Date().toISOString().split('T')[0]}`,
    title: 'Relatório de Usuários',
    subtitle: 'Lista completa de usuários do sistema',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'nome', header: 'Nome' },
      { key: 'email', header: 'Email' },
      { key: 'perfil', header: 'Perfil' },
      { key: 'ativo', header: 'Status', formatter: this.exportService.formatters.boolean },
      { key: 'createdAt', header: 'Data Criação', formatter: this.exportService.formatters.dateTime }
    ],
    data: this.users
  };

  await this.exportService.exportToPDF(options);
}
```

### Exemplo 2: Formatador Personalizado

```typescript
private statusFormatter = (status: string): string => {
  const statusMap = {
    'active': 'Ativo',
    'inactive': 'Inativo',
    'pending': 'Pendente'
  };
  return statusMap[status] || status;
};

// Uso na configuração
{ key: 'status', header: 'Status', formatter: this.statusFormatter }
```

### Exemplo 3: Acesso a Propriedades Aninhadas

```typescript
// Para acessar user.name em objetos aninhados
{ key: 'user.name', header: 'Nome do Usuário' }
```

## Componente com Menu Dropdown

Para criar um menu de exportação como no componente de logs:

### HTML Template

```html
<div class="export-dropdown" [class.active]="showExportMenu()">
  <button type="button" class="btn btn-primary" (click)="toggleExportMenu()">
    <lucide-icon [img]="Download"></lucide-icon>
    Exportar
  </button>

  @if (showExportMenu()) {
  <div class="export-menu">
    <button type="button" class="export-option" (click)="exportToExcel()">
      <lucide-icon [img]="FileText" size="16"></lucide-icon>
      <span>Excel (CSV)</span>
    </button>
    <button type="button" class="export-option" (click)="exportToPDF()">
      <lucide-icon [img]="Download" size="16"></lucide-icon>
      <span>PDF</span>
    </button>
  </div>
  }
</div>
```

### TypeScript Component

```typescript
protected readonly showExportMenu = signal(false);

protected toggleExportMenu(): void {
  this.showExportMenu.update(show => !show);
}

protected exportToExcel(): void {
  // configurar options...
  this.exportService.exportToExcel(options);
  this.showExportMenu.set(false);
}

protected exportToPDF(): void {
  // configurar options...
  this.exportService.exportToPDF(options);
  this.showExportMenu.set(false);
}
```

### CSS Styles

```css
.export-dropdown {
  position: relative;
  display: inline-block;
}

.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  min-width: 160px;
  margin-top: 4px;
  padding: 4px;
}

.export-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.export-option:hover {
  background-color: #f3f4f6;
}
```

## Características

### PDF
- Orientação landscape para mais espaço
- Cabeçalho com título e subtítulo
- Tabelas com zebra striping
- Paginação automática
- Rodapé com número de páginas
- Configuração de largura de colunas

### Excel (CSV)
- Formato UTF-8 com BOM
- Aspas duplas para campos de texto
- Escape automático de caracteres especiais
- Compatível com Excel, Google Sheets, etc.

## Tratamento de Erros

```typescript
try {
  await this.exportService.exportToPDF(options);
} catch (error) {
  console.error('Erro na exportação:', error);
  // Exibir mensagem de erro para o usuário
}
```

## Considerações de Performance

- As bibliotecas PDF são importadas dinamicamente
- Recomendado para datasets moderados (< 10k registros)
- Para datasets grandes, considere implementar paginação no backend