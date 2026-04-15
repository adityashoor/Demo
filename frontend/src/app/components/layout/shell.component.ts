import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-icon">🏭</span>
          <span class="brand-name">Labour Platform</span>
        </div>

        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/bookings" routerLinkActive="active" class="nav-item">
            <span class="icon">📋</span> Bookings
          </a>
          <a routerLink="/attendance" routerLinkActive="active" class="nav-item">
            <span class="icon">✅</span> Attendance
          </a>
          <a routerLink="/workers" routerLinkActive="active" class="nav-item">
            <span class="icon">👷</span> Workers
          </a>
          <a routerLink="/supervisors" routerLinkActive="active" class="nav-item">
            <span class="icon">🧑‍💼</span> Supervisors
          </a>
          <a routerLink="/businesses" routerLinkActive="active" class="nav-item">
            <span class="icon">🏢</span> Businesses
          </a>
          <a routerLink="/payroll" routerLinkActive="active" class="nav-item">
            <span class="icon">💰</span> Payroll
          </a>
          <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
            <span class="icon">📈</span> Analytics
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <span class="user-avatar">👤</span>
            <span>{{ auth.currentUser()?.name || 'Admin' }}</span>
          </div>
          <button class="logout-btn" (click)="auth.logout()">Logout</button>
        </div>
      </aside>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; }
    .sidebar {
      width: 240px; background: #1a1a2e; color: white;
      display: flex; flex-direction: column; flex-shrink: 0;
    }
    .brand {
      padding: 20px; font-size: 18px; font-weight: 700;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; gap: 10px;
    }
    .brand-icon { font-size: 24px; }
    .nav { flex: 1; padding: 10px 0; overflow-y: auto; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 20px; color: rgba(255,255,255,0.7);
      text-decoration: none; transition: all 0.2s;
    }
    .nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
    .nav-item.active { background: #e94560; color: white; }
    .icon { font-size: 18px; }
    .sidebar-footer {
      padding: 15px; border-top: 1px solid rgba(255,255,255,0.1);
    }
    .user-info { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 14px; }
    .logout-btn {
      width: 100%; padding: 8px; background: rgba(255,255,255,0.1);
      color: white; border: none; border-radius: 6px; cursor: pointer;
    }
    .logout-btn:hover { background: #e94560; }
    .content { flex: 1; overflow-y: auto; background: #f5f5f5; }
  `]
})
export class ShellComponent {
  constructor(public auth: AuthService) {}
}
