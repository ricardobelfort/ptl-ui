# Dashboard Layout - PTL UI

## 📋 Visão Geral

Este documento descreve a implementação do layout de dashboard para a aplicação PTL UI, criado com uma arquitetura moderna de componentes Angular standalone.

## 🏗️ Estrutura dos Componentes

### 1. **DashboardLayout** (`/shared/components/dashboard/layout/`)
- **Responsabilidade**: Componente principal que organiza o layout completo
- **Funcionalidades**:
  - Container principal do dashboard
  - Gerencia posicionamento de header, sidebar e conteúdo
  - Layout responsivo
  - Integração com router outlet

### 2. **DashboardHeader** (`/shared/components/dashboard/header/`)
- **Responsabilidade**: Cabeçalho do dashboard
- **Funcionalidades**:
  - Logo da aplicação (PTL)
  - Menu de usuário com dropdown
  - Avatar do usuário (inicial ou imagem)
  - Informações do usuário (nome e role)
  - Ações: Perfil, Configurações, Logout
  - Overlay para fechar menu ao clicar fora
  - Design responsivo

### 3. **DashboardSidebar** (`/shared/components/dashboard/sidebar/`)
- **Responsabilidade**: Menu lateral de navegação
- **Funcionalidades**:
  - Navegação principal da aplicação
  - Botão de colapsar/expandir
  - Suporte a menu hierárquico (com submenus)
  - Ícones SVG para cada item
  - Badge/notificações em itens de menu
  - Estado ativo baseado na rota atual
  - Tooltip em modo colapsado
  - Footer com informações da versão

## 🎨 Design System

### Cores Principais
```css
Primary: #3b82f6 (Azul)
Success: #16a34a (Verde)
Warning: #d97706 (Laranja)
Info: #6366f1 (Índigo)
Background: #f8fafc (Cinza claro)
Sidebar: #1f2937 (Cinza escuro)
```

### Dimensões
- **Header Height**: 64px
- **Sidebar Width (Expandida)**: 280px
- **Sidebar Width (Colapsada)**: 64px
- **Content Padding**: 2rem (desktop), 1rem (mobile)

### Breakpoints Responsivos
- **Desktop**: >= 1025px
- **Tablet**: 768px - 1024px
- **Mobile**: <= 767px

## 🚀 Funcionalidades Implementadas

### Dashboard Home
- **Welcome Section**: Saudação personalizada com horário atual
- **Stats Cards**: Métricas principais com ícones e indicadores
- **Quick Actions**: Ações rápidas com cards interativos
- **Recent Activity**: Lista de atividades recentes
- **Design Responsivo**: Adaptação completa para mobile

### Navegação
- **Dashboard**: /home
- **Internos**: /internos (com submenu)
  - Lista: /internos/list
  - Cadastrar: /internos/form
- **Relatórios**: /reports (placeholder)
- **Configurações**: /settings (placeholder)

### Estados Interativos
- **Hover Effects**: Elevação e mudança de cor
- **Active States**: Indicação visual da página atual
- **Loading States**: Preparado para indicadores de carregamento
- **Error Handling**: Estrutura para tratamento de erros

## 📱 Responsividade

### Desktop (>= 1025px)
- Sidebar sempre visível
- Botão de colapsar funcional
- Layout de 3 colunas para stats

### Tablet (768px - 1024px)
- Sidebar oculta por padrão
- Overlay quando aberta
- Layout de 2 colunas para stats

### Mobile (<= 768px)
- Sidebar em modo overlay
- Header compacto (oculta nome do usuário)
- Layout de 1 coluna
- Cards empilhados

## 🔧 Configuração e Uso

### Rotas Atualizadas
```typescript
export const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'internos/list', component: List },
      { path: 'internos/form', component: Form },
      // ... outras rotas
    ],
  },
];
```

### Imports Necessários
```typescript
import { DashboardLayout } from './shared/components/dashboard/layout/dashboard-layout';
```

### Integração com AuthService
- Header consome dados do usuário autenticado
- Logout integrado com o serviço de autenticação
- Guards protegem as rotas do dashboard

## 🎯 Próximos Passos

### Funcionalidades Planejadas
1. **Search Bar**: Barra de busca global no header
2. **Notifications**: Sistema de notificações
3. **Themes**: Suporte a temas claro/escuro
4. **Breadcrumbs**: Navegação hierárquica
5. **Keyboard Navigation**: Suporte completo para navegação por teclado

### Melhorias de Performance
1. **Lazy Loading**: Carregamento sob demanda de componentes
2. **Virtual Scrolling**: Para listas grandes
3. **OnPush Strategy**: Otimização de change detection (já implementado)

### Acessibilidade
1. **ARIA Labels**: Melhorar labels para screen readers
2. **Focus Management**: Gerenciamento de foco em modais
3. **High Contrast**: Suporte a modo de alto contraste

## 📋 Testes

Os componentes estão preparados para testes unitários com:
- TestBed configuration
- Mock dos serviços necessários
- Testes de interação do usuário
- Testes de responsividade

## 🔗 Dependências

- **Angular 18+**: Framework principal
- **RouterModule**: Navegação
- **CommonModule**: Diretivas básicas
- **AuthService**: Serviço de autenticação
- **Standalone Components**: Arquitetura moderna do Angular

---

*Documentação criada em: 18/10/2025*
*Versão: 1.0.0*