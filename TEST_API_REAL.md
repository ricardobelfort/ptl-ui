# 🚀 **Teste com API Real - Guia Passo a Passo**

## ✅ **Configuração Atual**
- ✅ Mock desabilitado (`mockApi: false`)
- ✅ API URL: `http://localhost:3000/api/v1`
- ✅ Endpoint de login: `POST /api/v1/auth/login`
- ✅ URLs dos endpoints corrigidas

## 🧪 **Como Testar**

### **1. Certifique-se que sua API está rodando**
```bash
# Teste básico de conectividade
curl http://localhost:3000/api/v1/auth/login

# Ou teste com credenciais válidas
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "SEU_EMAIL_VALIDO",
    "password": "SUA_SENHA_VALIDA"
  }'
```

### **2. Teste na aplicação Angular**
1. **Acesse:** `http://localhost:4201`
2. **Use credenciais válidas da sua API**
3. **Observe no DevTools (F12):**
   - Aba **Network** → Deve mostrar requisição para `http://localhost:3000/api/v1/auth/login`
   - Aba **Console** → Verificar se há erros

### **3. Resultados Esperados**

#### **✅ Login Bem-sucedido:**
- Requisição retorna status `200`
- Resposta contém: `access_token`, `token_type`, `expires_in`, `perfil`, `nome`
- Usuário é redirecionado para `/app/home`
- Token é salvo no localStorage

#### **❌ Possíveis Erros:**

**Status 401 - Credenciais Inválidas:**
```json
{"message": "Credenciais inválidas"}
```
→ Verifique email/senha

**Status 0 - Servidor Não Disponível:**
```
"Servidor não disponível. Verifique se a API está rodando..."
```
→ Sua API não está rodando ou há problema de CORS

**Status 404 - Endpoint Não Encontrado:**
```
"Not Found"
```
→ Endpoint `/api/v1/auth/login` não existe na sua API

## 🔍 **Debug em Tempo Real**

### **DevTools - Network Tab:**
1. Abra DevTools (F12)
2. Vá para aba **Network**
3. Faça login
4. Procure por requisição para `auth/login`
5. Clique na requisição para ver:
   - **Request Headers**
   - **Request Payload**
   - **Response**

### **DevTools - Console:**
Mensagens de erro aparecerão aqui se houver problemas.

### **DevTools - Application → Storage:**
Após login bem-sucedido, verificar:
- `Local Storage → auth_token`: JWT token
- `Local Storage → auth_user`: Dados do usuário

## 🛠️ **Possíveis Ajustes Necessários**

### **1. Se sua API espera campos diferentes:**
```typescript
// Se sua API espera 'username' em vez de 'email'
// Podemos ajustar em: src/app/core/interfaces/auth.interface.ts
export interface LoginRequest {
  username: string;  // em vez de email
  password: string;
  rememberMe?: boolean;
}
```

### **2. Se sua API retorna estrutura diferente:**
```typescript
// Podemos ajustar o normalizeLoginResponse()
// Para mapear a resposta da sua API
```

### **3. Se há problemas de CORS:**
Sua API precisa permitir:
```javascript
// Headers permitidos
Access-Control-Allow-Origin: http://localhost:4201
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 📊 **Resultado do Teste**

Após testar, me informe:

1. **Status da requisição** (200, 401, 404, 0, etc.)
2. **Resposta da API** (se houver)
3. **Mensagem de erro** (se aparecer na tela)
4. **Console logs** (se houver erros no DevTools)

## 🔄 **Se Precisar Voltar ao Mock**

```typescript
// src/app/core/config/environment.ts
mockApi: true  // Volta temporariamente para mock
```

---

**Status:** 🔄 **Testando API Real**
**URL:** `http://localhost:4201`
**Próximo:** Fazer login com credenciais reais da sua API