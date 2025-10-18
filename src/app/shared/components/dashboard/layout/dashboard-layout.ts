import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardHeader } from '../header/dashboard-header';
import { DashboardSidebar } from '../sidebar/dashboard-sidebar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardHeader,
    DashboardSidebar
  ],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayout { }