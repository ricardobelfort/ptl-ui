import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  List,
  LucideAngularModule,
  Menu,
  Settings,
  UserPlus,
  Users,
  X
} from 'lucide-angular';

interface NavigationItem {
  id: string;
  label: string;
  icon: any; // Lucide icon
  route?: string;
  badge?: string;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrls: ['./dashboard-sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebar {
  protected readonly isCollapsed = signal(false);
  protected readonly expandedItems = signal<Set<string>>(new Set());

  // Lucide icons
  protected readonly Menu = Menu;
  protected readonly X = X;
  protected readonly ChevronDown = ChevronDown;
  protected readonly LayoutDashboard = LayoutDashboard;
  protected readonly Users = Users;
  protected readonly List = List;
  protected readonly UserPlus = UserPlus;
  protected readonly BarChart3 = BarChart3;
  protected readonly Settings = Settings;

  protected readonly navigationItems = signal<NavigationItem[]>([
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/home',
      icon: this.LayoutDashboard
    },
    {
      id: 'internos',
      label: 'Internos',
      icon: this.Users,
      children: [
        {
          id: 'internos-list',
          label: 'Lista',
          route: '/internos/list',
          icon: this.List
        },
        {
          id: 'internos-form',
          label: 'Novo Interno',
          route: '/internos/form',
          icon: this.UserPlus
        }
      ]
    },
    {
      id: 'reports',
      label: 'Relatórios',
      route: '/reports',
      icon: this.BarChart3
    },
    {
      id: 'settings',
      label: 'Configurações',
      route: '/settings',
      icon: this.Settings
    }
  ]);

  protected readonly sidebarClass = computed(() => {
    return this.isCollapsed() ? 'sidebar collapsed' : 'sidebar';
  });

  protected toggleSidebar(): void {
    this.isCollapsed.update(collapsed => !collapsed);
  }

  protected toggleMenuItem(itemId: string): void {
    this.expandedItems.update(expanded => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  }

  protected isItemExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }
}