# LoadingComponent - Componente de Carregamento Global

Um componente reutilizável para exibir estados de carregamento em toda a aplicação.

## 📍 Localização

```
src/app/shared/components/loading/
├── loading.ts          # Componente principal
└── index.ts           # Barrel export
```

## 🚀 Como Usar

### Importação

```typescript
import { LoadingComponent } from '../../shared/components';

@Component({
  imports: [LoadingComponent],
  // ...
})
```

### Uso Básico

```html
<!-- Loading simples -->
<app-loading />

<!-- Com mensagem personalizada -->
<app-loading message="Carregando dados..." />

<!-- Loading em tela cheia -->
<app-loading [fullscreen]="true" message="Processando..." />
```

## ⚙️ Configurações

### Tipos de Loading

| Tipo | Descrição | Uso Recomendado |
|------|-----------|-----------------|
| `spinner` | Spinner circular padrão | Carregamento geral |
| `refresh` | Ícone de refresh rotativo | Atualizações de dados |
| `circle` | Círculo com animação | Carregamento discreto |
| `dots` | Três pontos pulsantes | Carregamento minimalista |

```html
<app-loading type="spinner" />
<app-loading type="refresh" />
<app-loading type="circle" />
<app-loading type="dots" />
```

### Tamanhos

| Tamanho | Dimensões | Uso |
|---------|-----------|-----|
| `sm` | 16px | Botões, elementos pequenos |
| `md` | 24px | Padrão, elementos médios |
| `lg` | 32px | Seções principais, modais |

```html
<app-loading size="sm" />
<app-loading size="md" />
<app-loading size="lg" />
```

### Layouts

| Layout | Descrição | Quando Usar |
|--------|-----------|-------------|
| `inline` | Elemento inline | Dentro de texto ou botões |
| `minimal` | Apenas o ícone, sem container | Espaços reduzidos |
| `fullscreen` | Tela cheia com overlay | Carregamento principal |

```html
<app-loading layout="inline" />
<app-loading layout="minimal" />
<app-loading layout="fullscreen" />
```

## 🎨 Exemplos Práticos

### 1. Loading de Tabela

```html
<!-- Estado de carregamento para dados de tabela -->
<app-loading 
  type="refresh" 
  size="lg" 
  message="Carregando logs..." 
  [fullscreen]="true" />
```

### 2. Loading de Botão

```html
<!-- Loading inline em botão -->
<button [disabled]="isLoading">
  <app-loading 
    *ngIf="isLoading" 
    type="spinner" 
    size="sm" 
    layout="inline" />
  {{ isLoading ? 'Salvando...' : 'Salvar' }}
</button>
```

### 3. Loading de Modal

```html
<!-- Loading central em modal -->
<div class="modal-content">
  <app-loading 
    *ngIf="isProcessing"
    type="circle" 
    size="md" 
    message="Processando dados..." />
</div>
```

### 4. Loading Discreto

```html
<!-- Loading minimalista -->
<div class="data-section">
  <h3>Relatórios</h3>
  <app-loading 
    *ngIf="loadingReports"
    type="dots" 
    size="sm" 
    layout="minimal" />
</div>
```

## 📋 API Completa

### Inputs

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `type` | `'spinner' \| 'refresh' \| 'circle' \| 'dots'` | `'spinner'` | Tipo de animação |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do componente |
| `layout` | `'inline' \| 'minimal' \| 'fullscreen'` | `undefined` | Layout do container |
| `message` | `string` | `undefined` | Mensagem de carregamento |
| `fullscreen` | `boolean` | `false` | Ativa modo tela cheia |

### Estrutura CSS

```css
.loading-container {
  /* Container principal */
}

.loading-content {
  /* Conteúdo centralizado */
}

.loading-icon {
  /* Ícone animado */
}

.loading-message {
  /* Texto da mensagem */
}

.loading-overlay {
  /* Overlay para fullscreen */
}
```

## 🎨 Customização

### Cores

O componente usa variáveis CSS do tema:

```css
:root {
  --primary-color: #2563eb;
  --text-secondary: #6b7280;
  --surface-background: #ffffff;
}
```

### Animações

As animações são otimizadas e suaves:

- **Spinner**: Rotação contínua de 360°
- **Refresh**: Rotação com easing
- **Circle**: Pulso suave
- **Dots**: Animação sequencial

## 🔧 Integração com Estados

### Com Signals (Recomendado)

```typescript
export class MyComponent {
  loading = signal(false);
  
  async loadData() {
    this.loading.set(true);
    try {
      await this.dataService.getData();
    } finally {
      this.loading.set(false);
    }
  }
}
```

```html
<app-loading 
  *ngIf="loading()"
  type="refresh" 
  message="Carregando dados..." />
```

### Com Observables

```typescript
export class MyComponent {
  loading$ = new BehaviorSubject(false);
  
  loadData() {
    this.loading$.next(true);
    this.dataService.getData()
      .pipe(finalize(() => this.loading$.next(false)))
      .subscribe();
  }
}
```

```html
<app-loading 
  *ngIf="loading$ | async"
  type="spinner" 
  message="Processando..." />
```

## 🏗️ Arquitetura

### Padrão de Design

- **Composição**: Componente composto com múltiplas variações
- **Signal-based**: Usa Angular Signals para reatividade
- **Standalone**: Componente independente sem módulos
- **Tipado**: TypeScript com tipos específicos

### Performance

- **Tree-shaking**: Apenas importa o que é usado
- **CSS otimizado**: Animações com `transform` para performance
- **Lazy loading**: Ícones carregados sob demanda

## 📱 Responsividade

O componente é totalmente responsivo:

```css
/* Mobile first */
@media (max-width: 768px) {
  .loading-container.fullscreen {
    padding: 1rem;
  }
}
```

## ✅ Acessibilidade

- **ARIA**: Atributos adequados para leitores de tela
- **Semântica**: HTML semântico
- **Contraste**: Cores com contraste adequado

```html
<div 
  role="status" 
  aria-live="polite" 
  aria-label="Carregando conteúdo">
```

## 🧪 Testes

```typescript
describe('LoadingComponent', () => {
  it('should display correct loading type', () => {
    component.type.set('refresh');
    expect(fixture.debugElement.query(By.css('lucide-refresh-cw'))).toBeTruthy();
  });
});
```

---

**Desenvolvido para PTL-UI** 🚀