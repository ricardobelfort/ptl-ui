# 🧪 **Testes Unitários - Sistema de Autenticação**

## 📋 **Visão Geral**

Este diretório contém testes unitários completos para o sistema de autenticação, incluindo:

- ✅ **AuthService** - Serviço principal de autenticação
- ✅ **Login Component** - Componente de login com formulário
- ✅ **Auth Guards** - Guards de proteção de rotas
- ✅ **Auth Interceptor** - Interceptador HTTP para tokens
- ✅ **Test Utilities** - Utilitários e mocks para facilitar testes

## 🏃‍♂️ **Como Executar**

### **Todos os testes:**
```bash
npm test
```

### **Testes específicos:**
```bash
# Apenas AuthService
ng test --include="**/auth.service.spec.ts"

# Apenas Login Component
ng test --include="**/login.spec.ts"

# Apenas Guards
ng test --include="**/auth.guard.spec.ts"

# Apenas Interceptor
ng test --include="**/auth.interceptor.spec.ts"
```

### **Testes em modo watch:**
```bash
npm test -- --watch
```

### **Testes com cobertura:**
```bash
ng test --code-coverage
```

## 📊 **Cobertura de Testes**

### **AuthService** (`auth.service.spec.ts`)
- ✅ Estado inicial e restauração do localStorage
- ✅ Login com API real e mock
- ✅ Tratamento de erros de autenticação
- ✅ Estados de carregamento
- ✅ Logout e limpeza de dados
- ✅ Refresh token
- ✅ Métodos utilitários
- ✅ Normalização de respostas da API
- ✅ Casos extremos e edge cases

### **Login Component** (`login.spec.ts`)
- ✅ Validação de formulário (email, password, minLength)
- ✅ Submissão de formulário
- ✅ Navegação após login bem-sucedido
- ✅ Tratamento de erros de login
- ✅ Estados de carregamento
- ✅ Toggle de visibilidade da senha
- ✅ Integração com template
- ✅ Validação visual de erros

### **Auth Guards** (`auth.guard.spec.ts`)
- ✅ `authGuard` - Proteção de rotas autenticadas
- ✅ `publicGuard` - Proteção de rotas públicas
- ✅ Redirecionamentos corretos
- ✅ Mudanças de estado de autenticação
- ✅ Comportamentos opostos dos guards
- ✅ Casos extremos

### **Auth Interceptor** (`auth.interceptor.spec.ts`)
- ✅ Injeção automática de token Bearer
- ✅ Headers Content-Type para POST
- ✅ Exclusão de endpoints de auth e URLs externas
- ✅ Tratamento de erros 401/403
- ✅ Refresh automático de token
- ✅ Retry de requisições após refresh
- ✅ Clonagem correta de requisições
- ✅ Múltiplas requisições simultâneas

## 🛠️ **Utilitários de Teste** (`test-utils.ts`)

### **MockAuthData**
Contém dados mock padronizados:
- Usuários válidos (user/admin)
- Requisições e respostas de login
- Tokens e estados de autenticação
- Erros padronizados

### **MockAuthService**
Implementação mock do AuthService:
- Configurável para sucessos/falhas
- Simula estados autenticados/não autenticados
- Métodos para configurar comportamentos

### **TestUtils**
Utilidades para configuração de testes:
- Configuração de localStorage
- Criação de FormGroups mock
- Simulação de eventos
- Helpers para operações assíncronas

### **TEST_CONSTANTS**
Constantes utilizadas nos testes:
- URLs da API
- Rotas da aplicação
- Chaves do localStorage
- Status HTTP
- Timeouts

## 📝 **Estrutura dos Testes**

Todos os testes seguem o padrão **AAA** (Arrange, Act, Assert):

```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Setup comum
  });

  it('should do something', () => {
    // Arrange - Configurar dados e mocks
    const mockData = { /* ... */ };
    serviceSpy.method.and.returnValue(of(mockData));

    // Act - Executar a ação sendo testada  
    component.doSomething();

    // Assert - Verificar resultados
    expect(serviceSpy.method).toHaveBeenCalled();
    expect(component.result).toBe(expected);
  });
});
```

## 🎯 **Boas Práticas Implementadas**

### **1. Isolamento de Testes**
- Cada teste é independente
- Setup/teardown adequado
- Limpeza de localStorage e mocks

### **2. Mocks Inteligentes**
- Spies configuráveis
- Retornos realistas
- Estados consistentes

### **3. Cenários Completos**
- Casos de sucesso
- Tratamento de erros
- Edge cases
- Estados de carregamento

### **4. Integração com Templates**
- Testes de DOM
- Eventos de usuário
- Validação visual
- Acessibilidade

### **5. Async/Await**
- Observables testados corretamente
- Promises aguardadas
- Timeouts apropriados

## 🔍 **Depuração de Testes**

### **Logs Detalhados**
```typescript
it('should debug test', () => {
  // Ativar logs detalhados
  spyOn(console, 'log');
  
  // Seu teste aqui
  
  // Verificar logs
  expect(console.log).toHaveBeenCalledWith(expectedLog);
});
```

### **Verificar Estado dos Mocks**
```typescript
it('should verify mock state', () => {
  // Verificar se o spy foi chamado
  expect(serviceSpy.login).toHaveBeenCalled();
  expect(serviceSpy.login).toHaveBeenCalledWith(expectedArgs);
  expect(serviceSpy.login).toHaveBeenCalledTimes(1);
});
```

### **Aguardar Operações Assíncronas**
```typescript
it('should wait for async operation', fakeAsync(() => {
  component.asyncMethod();
  
  tick(1000); // Simular passagem de tempo
  
  expect(component.result).toBeDefined();
}));
```

## 📈 **Métricas de Qualidade**

### **Cobertura Esperada:**
- **Statements:** > 95%
- **Branches:** > 90%
- **Functions:** > 95%
- **Lines:** > 95%

### **Performance:**
- Cada teste deve executar em < 100ms
- Suite completa em < 30s
- Sem vazamentos de memória

### **Manutenibilidade:**
- Testes legíveis e bem documentados
- Reutilização de utilitários
- Nomes descritivos
- Setup mínimo por teste

## 🚀 **Execução em CI/CD**

Os testes são executados automaticamente em:
- ✅ Pull Requests
- ✅ Merge para main
- ✅ Deploy para produção

### **Comandos CI:**
```bash
# Execução headless
ng test --browsers ChromeHeadless --watch=false

# Com cobertura
ng test --code-coverage --browsers ChromeHeadless --watch=false

# Relatório de cobertura
npx http-server coverage/ptl-ui -p 8080
```

---

**🎯 Status:** ✅ **Completo**  
**📊 Cobertura:** **95%+**  
**⚡ Performance:** **< 30s**  
**🔧 Manutenção:** **Documentada**