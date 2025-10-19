import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const CustomPreset = definePreset(Aura, {
  extend: {
    // Definir tokens customizados para métodos HTTP
    method: {
      get: {
        background: '{green.100}',
        color: '{green.800}',
        border: '{green.200}'
      },
      post: {
        background: '{blue.100}',
        color: '{blue.800}',
        border: '{blue.200}'
      },
      put: {
        background: '{orange.100}',
        color: '{orange.800}',
        border: '{orange.200}'
      },
      patch: {
        background: '{purple.100}',
        color: '{purple.800}',
        border: '{purple.200}'
      },
      delete: {
        background: '{red.100}',
        color: '{red.800}',
        border: '{red.200}'
      }
    },
    // Definir tokens customizados para status
    status: {
      success: {
        background: '{green.100}',
        color: '{green.800}',
        border: '{green.200}'
      },
      error: {
        background: '{red.100}',
        color: '{red.800}',
        border: '{red.200}'
      },
      warning: {
        background: '{orange.100}',
        color: '{orange.800}',
        border: '{orange.200}'
      }
    },
    // Definir tokens customizados para sucesso
    success: {
      yes: {
        background: '{green.100}',
        color: '{green.800}',
        border: '{green.200}'
      },
      no: {
        background: '{red.100}',
        color: '{red.800}',
        border: '{red.200}'
      }
    },
    // Definir tokens customizados para perfis de usuário
    profile: {
      admin: {
        background: '{red.100}',
        color: '{red.800}',
        border: '{red.200}'
      },
      manager: {
        background: '{blue.100}',
        color: '{blue.800}',
        border: '{blue.200}'
      },
      user: {
        background: '{gray.100}',
        color: '{gray.800}',
        border: '{gray.200}'
      }
    }
  },
  // CSS customizado para aplicar os tokens
  css: ({ dt }) => `
    .badge-method-get {
      background-color: ${dt('method.get.background')};
      color: ${dt('method.get.color')};
      border: 1px solid ${dt('method.get.border')};
    }
    
    .badge-method-post {
      background-color: ${dt('method.post.background')};
      color: ${dt('method.post.color')};
      border: 1px solid ${dt('method.post.border')};
    }
    
    .badge-method-put {
      background-color: ${dt('method.put.background')};
      color: ${dt('method.put.color')};
      border: 1px solid ${dt('method.put.border')};
    }
    
    .badge-method-patch {
      background-color: ${dt('method.patch.background')};
      color: ${dt('method.patch.color')};
      border: 1px solid ${dt('method.patch.border')};
    }
    
    .badge-method-delete {
      background-color: ${dt('method.delete.background')};
      color: ${dt('method.delete.color')};
      border: 1px solid ${dt('method.delete.border')};
    }
    
    .badge-status-success {
      background-color: ${dt('status.success.background')};
      color: ${dt('status.success.color')};
      border: 1px solid ${dt('status.success.border')};
    }
    
    .badge-status-error {
      background-color: ${dt('status.error.background')};
      color: ${dt('status.error.color')};
      border: 1px solid ${dt('status.error.border')};
    }
    
    .badge-status-warning {
      background-color: ${dt('status.warning.background')};
      color: ${dt('status.warning.color')};
      border: 1px solid ${dt('status.warning.border')};
    }
    
    .badge-success-yes {
      background-color: ${dt('success.yes.background')};
      color: ${dt('success.yes.color')};
      border: 1px solid ${dt('success.yes.border')};
    }
    
    .badge-success-no {
      background-color: ${dt('success.no.background')};
      color: ${dt('success.no.color')};
      border: 1px solid ${dt('success.no.border')};
    }
    
    .badge-admin {
      background-color: ${dt('profile.admin.background')};
      color: ${dt('profile.admin.color')};
      border: 1px solid ${dt('profile.admin.border')};
    }
    
    .badge-manager {
      background-color: ${dt('profile.manager.background')};
      color: ${dt('profile.manager.color')};
      border: 1px solid ${dt('profile.manager.border')};
    }
    
    .badge-user {
      background-color: ${dt('profile.user.background')};
      color: ${dt('profile.user.color')};
      border: 1px solid ${dt('profile.user.border')};
    }
    
    /* Dark mode styles */
    .dark .badge-method-get {
      background-color: ${dt('green.900')};
      color: ${dt('green.100')};
      border-color: ${dt('green.800')};
    }
    
    .dark .badge-method-post {
      background-color: ${dt('blue.900')};
      color: ${dt('blue.100')};
      border-color: ${dt('blue.800')};
    }
    
    .dark .badge-method-put {
      background-color: ${dt('orange.900')};
      color: ${dt('orange.100')};
      border-color: ${dt('orange.800')};
    }
    
    .dark .badge-method-patch {
      background-color: ${dt('purple.900')};
      color: ${dt('purple.100')};
      border-color: ${dt('purple.800')};
    }
    
    .dark .badge-method-delete {
      background-color: ${dt('red.900')};
      color: ${dt('red.100')};
      border-color: ${dt('red.800')};
    }
    
    .dark .badge-status-success {
      background-color: ${dt('green.900')};
      color: ${dt('green.100')};
      border-color: ${dt('green.800')};
    }
    
    .dark .badge-status-error {
      background-color: ${dt('red.900')};
      color: ${dt('red.100')};
      border-color: ${dt('red.800')};
    }
    
    .dark .badge-status-warning {
      background-color: ${dt('orange.900')};
      color: ${dt('orange.100')};
      border-color: ${dt('orange.800')};
    }
    
    .dark .badge-success-yes {
      background-color: ${dt('green.900')};
      color: ${dt('green.100')};
      border-color: ${dt('green.800')};
    }
    
    .dark .badge-success-no {
      background-color: ${dt('red.900')};
      color: ${dt('red.100')};
      border-color: ${dt('red.800')};
    }
    
    .dark .badge-admin {
      background-color: ${dt('red.900')};
      color: ${dt('red.100')};
      border-color: ${dt('red.800')};
    }
    
    .dark .badge-manager {
      background-color: ${dt('blue.900')};
      color: ${dt('blue.100')};
      border-color: ${dt('blue.800')};
    }
    
    .dark .badge-user {
      background-color: ${dt('gray.900')};
      color: ${dt('gray.100')};
      border-color: ${dt('gray.800')};
    }
  `
});