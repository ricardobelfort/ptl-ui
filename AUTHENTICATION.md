# 🔐 Sistema de Autenticação - PTL UI

## ✅ **Autenticação Real Implementada**

### 🚀 **Como Testar:**

#### **Credenciais para Teste (Modo Mock):**
```
Email: admin@ptl.com
Senha: 123456
```

### 🔧 **Funcionalidades Implementadas:**

#### **1. AuthService** (`src/app/core/services/auth.service.ts`)
- ✅ Login com JWT
- ✅ Logout com limpeza de dados
- ✅ Refresh token automático
- ✅ Validação de token
- ✅ Gerenciamento de estado com Signals
- ✅ Persistência no localStorage
- ✅ Tratamento de erros completo

#### **2. AuthGuard** (`src/app/core/guards/auth.guard.ts`)
- ✅ Proteção de rotas autenticadas
- ✅ Redirecionamento automático
- ✅ Validação de token em tempo real
- ✅ Guard para rotas públicas

#### **3. HTTP Interceptor** (`src/app/core/interceptors/auth.interceptor.ts`)
- ✅ Adição automática do Bearer token
- ✅ Refresh automático em caso de 401
- ✅ Tratamento de erros de autorização

#### **4. Interfaces e Tipos** (`src/app/core/interfaces/auth.interface.ts`)
- ✅ LoginRequest
- ✅ LoginResponse  
- ✅ User
- ✅ AuthState
- ✅ ApiError

### 🎯 **Estados da Aplicação:**

#### **Fluxo de Autenticação:**
1. **Acesso inicial** → Redireciona para `/login`
2. **Login válido** → Redireciona para `/app/home`
3. **Token expirado** → Refresh automático ou logout
4. **Acesso a rota protegida sem auth** → Redireciona para `/login`

#### **Signals Reativas:**
```typescript
authService.isAuthenticated() // boolean
authService.user()            // User | null
authService.isLoading()       // boolean
authService.authState()       // AuthState completo
```

### 🛠️ **Configuração para Produção:**

#### **1. Atualizar Environment** (`src/app/core/config/environment.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://sua-api.com/api', // URL da sua API real
  mockApi: false, // Desabilitar mock em produção
};
```

#### **2. Configurar Endpoints da API:**
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout  
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Validar token e obter usuário

#### **3. Formato Expected da API:**

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Login Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "avatar": "avatar_url"
  }
}
```

### 🔒 **Segurança Implementada:**

- ✅ **JWT Storage**: localStorage com fallback
- ✅ **Token Validation**: Verificação automática
- ✅ **Auto Refresh**: Renovação transparente
- ✅ **Route Protection**: Guards em todas as rotas
- ✅ **Error Handling**: Tratamento robusto de erros
- ✅ **XSS Protection**: Sanitização automática
- ✅ **CSRF Protection**: Headers seguros

### 📱 **UX Features:**

- ✅ **Loading States**: Feedback visual durante auth
- ✅ **Error Messages**: Mensagens contextuais
- ✅ **Remember Me**: Persistência opcional
- ✅ **Auto Redirect**: Navegação inteligente
- ✅ **Form Validation**: Validação em tempo real

### 🧪 **Como Testar:**

1. **Acesse**: `http://localhost:4201`
2. **Login com credenciais válidas**: 
   - Email: `admin@ptl.com`
   - Senha: `123456`
3. **Teste login inválido** com credenciais erradas
4. **Navegue** para `/app/home` (deve funcionar)
5. **Acesse** `/login` quando autenticado (deve redirecionar)
6. **Faça logout** e tente acessar rotas protegidas

### 🚨 **Próximos Passos:**

1. **Conectar à API real** (desabilitar mock)
2. **Implementar recuperação de senha**
3. **Adicionar registro de usuários**  
4. **Implementar perfis de usuário**
5. **Adicionar logs de auditoria**

---

**Tecnologias utilizadas:**
- Angular 20.3 com Signals
- RxJS para programação reativa
- JWT para autenticação
- TypeScript com strict mode
- Tailwind CSS para styling