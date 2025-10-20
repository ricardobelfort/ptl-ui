/**
 * Configuração de ambiente para desenvolvimento
 * Permite simular API durante desenvolvimento sem backend
 */

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1', // URL da API real
  mockApi: false, // Mock desabilitado - usando API real
};

/**
 * Mock de dados para desenvolvimento - APENAS para testes unitários
 * Não usado em produção - API real em http://localhost:3000
 */
export const mockAuthData = {
  // Dados simulados de usuário para teste - APENAS para testes unitários
  validCredentials: {
    email: 'admin@ptl.local',
    password: 'admin123',
  },

  // Resposta simulada de login bem-sucedido - APENAS para testes unitários
  loginResponse: {
    access_token: 'mock_jwt_token_here',
    refresh_token: 'mock_refresh_token_here',
    token_type: 'Bearer',
    expires_in: 3600,
    user: {
      id: '1',
      email: 'admin@ptl.local',
      name: 'Administrador Geral',
      role: 'ADMIN',
      avatar: 'https://via.placeholder.com/150',
    },
  },

  // Dados de usuários para teste - APENAS para testes unitários
  users: [
    {
      id: '1',
      email: 'admin@ptl.local',
      name: 'Administrador Geral',
      role: 'ADMIN',
    },
  ],
};