# 🧪 GUIA DE TESTE - SISTEMA DE REFRESH TOKEN

## Preparação do Teste

### 1. Abrir Console do Navegador
- Pressione F12 ou Cmd+Option+I
- Vá para a aba "Console"

### 2. Fazer Login
- Faça login na aplicação com credenciais válidas
- Observe os logs no console durante o login

## Testes a Executar

### Teste 1: Verificar Token Inicial
```javascript
// No console do navegador:
window.authService.getTokenInfo()
```
**Resultado esperado:**
- hasToken: true
- hasRefreshToken: true  
- expiryTime: data/hora futura
- timeUntilExpiry: segundos até expirar
- isNearExpiry: false (se token ainda válido)

### Teste 2: Configurar Expiração Curta
```javascript
// No console:
window.authService.setShortExpiryForTesting()
```
**Resultado esperado:**
- Log: "🧪 Test mode: Token will expire in 2 minutes"
- Log: "Token refresh scheduled in 60 seconds"

### Teste 3: Monitorar Renovação Automática
```javascript
// No console:
setInterval(() => {
  const info = window.authService.getTokenInfo();
  console.log(`⏱️ Expira em: ${info.timeUntilExpiry}s | Próximo: ${info.isNearExpiry}`);
}, 10000);
```
**Resultado esperado:**
- Countdown regressivo a cada 10 segundos
- Após ~60 segundos: log "Auto-refreshing token..."
- Log: "Token refreshed successfully"

### Teste 4: Refresh Manual
```javascript
// No console:
window.authService.checkAndRefreshToken().subscribe({
  next: () => console.log('✅ Success'),
  error: (e) => console.error('❌ Error:', e)
});
```

### Teste 5: Testar Interceptador HTTP
```javascript
// Fazer uma requisição que seria interceptada:
fetch('/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + window.authService.getToken()
  }
}).then(r => console.log('Response:', r.status));
```

## Botões de Teste (Interface)

No header da aplicação você verá 3 botões:
- **Token Info**: Mostra informações do token atual
- **Set 2min Expiry**: Define token para expirar em 2 minutos
- **Refresh Now**: Força renovação manual do token

## Cenários de Teste

### Cenário 1: Renovação Proativa (Sucesso)
1. Login → Token válido por 15min
2. Configurar expiração curta (2min)
3. Aguardar 1 minuto
4. Observar renovação automática
5. Verificar novo token

### Cenário 2: Renovação por Interceptador
1. Token próximo do vencimento
2. Fazer requisição HTTP (navegar entre páginas)
3. Observar interceptação e renovação
4. Requisição deve completar com sucesso

### Cenário 3: Falha na Renovação
1. Remover refresh_token do localStorage
2. Tentar renovação manual
3. Observar redirecionamento para login

## Logs Esperados

✅ **Login bem-sucedido:**
```
Token refresh scheduled in XXX seconds
```

✅ **Renovação automática:**
```
Auto-refreshing token...
Attempting to refresh token...
Token refreshed successfully
Token refresh scheduled in XXX seconds
```

✅ **Interceptador funcionando:**
```
Auto-refreshing token...
Token refreshed successfully
```

❌ **Falha (esperada se refresh_token inválido):**
```
Token refresh failed: [erro]
Logging out user...
```

## Comandos Úteis

```javascript
// Verificar localStorage
Object.keys(localStorage).filter(k => k.includes('token') || k.includes('auth'))

// Limpar tokens manualmente
localStorage.removeItem('auth_token')
localStorage.removeItem('refresh_token')

// Ver estado atual do AuthService
window.authService.authState()
```