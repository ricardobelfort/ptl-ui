# Sistema de Notificações Toast - PrimeNG

Este projeto implementa um sistema completo de notificações usando o Toast do PrimeNG, seguindo as melhores práticas da documentação oficial.

## 🚀 Configuração

### 1. Configuração no `app.config.ts`
O `MessageService` é configurado globalmente:

```typescript
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    MessageService,
  ],
};
```

### 2. Componente Toast no `app.html`
O componente Toast é adicionado no template principal:

```html
<div class="app">
  <router-outlet></router-outlet>
  <p-toast position="top-right" [life]="5000"></p-toast>
</div>
```

### 3. Imports necessários no `app.ts`
```typescript
import { ToastModule } from 'primeng/toast';

@Component({
  imports: [RouterOutlet, ToastModule],
})
export class App { }
```

## 📋 Serviço de Notificação

O `NotificationService` centraliza todas as operações de notificação e oferece métodos convenientes:

### Importação
```typescript
import { NotificationService } from '../core/services/notification.service';

export class MeuComponent {
  private readonly notificationService = inject(NotificationService);
}
```

## 🎯 Métodos Básicos

### Sucesso
```typescript
this.notificationService.success(
  'Operação realizada com sucesso!',
  'Seus dados foram salvos corretamente.'
);
```

### Erro
```typescript
this.notificationService.error(
  'Erro na operação',
  'Algo deu errado. Tente novamente.'
);
```

### Aviso
```typescript
this.notificationService.warn(
  'Atenção necessária',
  'Verifique os dados antes de continuar.'
);
```

### Informação
```typescript
this.notificationService.info(
  'Informação importante',
  'Nova atualização disponível no sistema.'
);
```

### Secundária
```typescript
this.notificationService.secondary(
  'Notificação secundária',
  'Informação adicional'
);
```

### Contraste
```typescript
this.notificationService.contrast(
  'Notificação de contraste',
  'Para destacar informações importantes'
);
```

## 🔧 Métodos Utilitários

### Operações CRUD
```typescript
// Sucesso em operações
this.notificationService.successOperation('criado', 'usuário');
this.notificationService.successOperation('atualizado', 'perfil');
this.notificationService.successOperation('excluído', 'registro');

// Erro em operações
this.notificationService.errorOperation('criar', 'usuário', 'Email já existe');
this.notificationService.errorOperation('carregar', 'dados');
```

### Validação
```typescript
this.notificationService.validationError('Preencha todos os campos obrigatórios');
```

### Estados específicos
```typescript
// Loading (sticky)
this.notificationService.loading('Processando dados...', true);

// Erro de rede
this.notificationService.networkError();

// Acesso negado
this.notificationService.accessDenied();

// Sessão expirada
this.notificationService.sessionExpired();
```

### Múltiplas notificações
```typescript
this.notificationService.showMultiple([
  { severity: 'success', summary: 'Sucesso', detail: 'Item 1 processado' },
  { severity: 'info', summary: 'Info', detail: 'Item 2 em progresso' },
  { severity: 'warn', summary: 'Aviso', detail: 'Item 3 precisa atenção' }
]);
```

### Limpeza
```typescript
// Limpar todas as notificações
this.notificationService.clear();

// Limpar por chave específica
this.notificationService.clearByKey('loading');
```

## ⚙️ Opções Avançadas

### Configurações personalizadas
```typescript
this.notificationService.success(
  'Título',
  'Mensagem',
  {
    life: 10000,        // 10 segundos
    sticky: true,       // Não desaparece automaticamente
    closable: false     // Não pode ser fechada manualmente
  }
);
```

### Posicionamento
O Toast está configurado para `top-right`, mas pode ser alterado no `app.html`:
- `top-left`
- `top-center` 
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right`
- `center`

## 📱 Responsividade

O Toast é configurado com breakpoints para diferentes tamanhos de tela:

```html
<p-toast 
  position="top-right" 
  [life]="5000"
  [breakpoints]="{ '920px': { width: '100%', right: '0', left: '0' } }">
</p-toast>
```

## 🎨 Personalização

### Temas
O Toast utiliza o sistema de temas do PrimeNG, seguindo as cores definidas no preset customizado.

### Animações
Configurações de animação podem ser ajustadas:

```html
<p-toast 
  [showTransitionOptions]="'250ms'" 
  [hideTransitionOptions]="'150ms'">
</p-toast>
```

## 📖 Exemplos Práticos

### Em um formulário
```typescript
onSubmit() {
  if (this.form.invalid) {
    this.notificationService.validationError();
    return;
  }

  this.notificationService.loading('Salvando...', true);
  
  this.apiService.save(this.form.value).subscribe({
    next: () => {
      this.notificationService.clear();
      this.notificationService.successOperation('salvo', 'formulário');
    },
    error: (err) => {
      this.notificationService.clear();
      this.notificationService.errorOperation('salvar', 'formulário', err.message);
    }
  });
}
```

### Em operações de API
```typescript
loadData() {
  this.apiService.getData().subscribe({
    next: (data) => {
      if (data.length === 0) {
        this.notificationService.info(
          'Nenhum registro encontrado',
          'Tente ajustar os filtros'
        );
      }
    },
    error: () => {
      this.notificationService.networkError();
    }
  });
}
```

### Em exportações
```typescript
async exportData() {
  try {
    this.notificationService.loading('Gerando relatório...', true);
    
    await this.exportService.generateReport();
    
    this.notificationService.clear();
    this.notificationService.success(
      'Relatório gerado',
      'Download iniciado automaticamente'
    );
  } catch (error) {
    this.notificationService.clear();
    this.notificationService.error(
      'Erro na exportação',
      'Não foi possível gerar o relatório'
    );
  }
}
```

## 🏆 Melhores Práticas

1. **Use sempre o NotificationService** em vez de chamar o MessageService diretamente
2. **Limpe notificações de loading** antes de mostrar resultado final
3. **Use métodos específicos** como `successOperation()` para ações CRUD
4. **Configure life apropriado** para cada tipo de notificação:
   - Success: 5 segundos (padrão)
   - Error: 7 segundos  
   - Warning: 6 segundos
   - Info: 5 segundos
5. **Use sticky apenas quando necessário** (loading, erros críticos)
6. **Forneça detalhes úteis** nas mensagens para ajudar o usuário

## 🔍 Debugging

Para debugar notificações, verifique:
1. Se o `MessageService` está nos providers
2. Se o `ToastModule` está importado no componente principal
3. Se o componente `<p-toast>` está no template principal
4. Se não há conflitos de z-index com outros elementos

## 📚 Referências

- [Documentação oficial PrimeNG Toast](https://primeng.org/toast)
- [PrimeNG MessageService API](https://primeng.org/toast#api)
- [Configuração de temas](https://primeng.org/theming)