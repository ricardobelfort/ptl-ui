// Script de teste para refresh token
// Cole este código no console do navegador após fazer login

// Função para mostrar info do token
function showTokenInfo() {
  const tokenInfo = window.authService?.getTokenInfo?.();
  if (tokenInfo) {
    console.table(tokenInfo);
  } else {
    console.log('AuthService não disponível ou não em modo de desenvolvimento');
  }
}

// Função para configurar teste de expiração curta
function setShortExpiry() {
  window.authService?.setShortExpiryForTesting?.();
  setTimeout(() => {
    console.log('📊 Token info após configurar expiração curta:');
    showTokenInfo();
  }, 1000);
}

// Função para forçar refresh manual
function forceRefresh() {
  console.log('🔄 Iniciando refresh manual...');
  window.authService?.checkAndRefreshToken?.()?.subscribe?.({
    next: () => {
      console.log('✅ Refresh manual concluído com sucesso');
      setTimeout(() => showTokenInfo(), 500);
    },
    error: (err) => {
      console.error('❌ Erro no refresh manual:', err);
    }
  });
}

// Monitorar automaticamente a cada 10 segundos
function startMonitoring() {
  console.log('🔍 Iniciando monitoramento automático do token...');
  const interval = setInterval(() => {
    const info = window.authService?.getTokenInfo?.();
    if (info && info.timeUntilExpiry !== null) {
      console.log(`⏱️  Token expira em: ${info.timeUntilExpiry}s | Próximo da expiração: ${info.isNearExpiry}`);

      if (info.timeUntilExpiry <= 0) {
        console.log('🚨 Token expirado!');
        clearInterval(interval);
      }
    }
  }, 10000);

  return interval;
}

console.log('🧪 Ferramentas de teste de refresh token carregadas!');
console.log('Comandos disponíveis:');
console.log('- showTokenInfo() - Mostra informações do token atual');
console.log('- setShortExpiry() - Define expiração em 2 minutos');
console.log('- forceRefresh() - Força refresh manual do token');
console.log('- startMonitoring() - Inicia monitoramento automático');

// Expor no window para uso global
window.tokenTest = {
  showTokenInfo,
  setShortExpiry,
  forceRefresh,
  startMonitoring
};