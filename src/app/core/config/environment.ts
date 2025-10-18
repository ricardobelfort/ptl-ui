/**
 * Configuração de ambiente para desenvolvimento
 * Permite simular API durante desenvolvimento sem backend
 */

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1', // URL da sua API
  mockApi: false, // Ativar/desativar mock da API para desenvolvimento
};

/**
 * Mock de dados para desenvolvimento
 * Remove esta seção quando conectar à API real
 */
export const mockAuthData = {
  // Dados simulados de usuário para teste
  validCredentials: {
    email: 'admin@ptl.com',
    password: '123456',
  },
  
  // Resposta simulada de login bem-sucedido (formato normalizado)
  loginResponse: {
    access_token: 'mock_jwt_token_here',
    refresh_token: 'mock_refresh_token_here',
    token_type: 'Bearer',
    expires_in: 3600,
    user: {
      id: '1',
      email: 'admin@ptl.com',
      name: 'Administrador',
      role: 'admin',
      avatar: 'https://via.placeholder.com/150',
    },
  },

  // Dados de usuários para teste
  users: [
    {
      id: '1',
      email: 'admin@ptl.com',
      name: 'Administrador',
      role: 'admin',
    },
    {
      id: '2',
      email: 'user@ptl.com',
      name: 'Usuário',
      role: 'user',
    },
  ],
};