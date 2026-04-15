import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-box">
        <div class="brand">
          <span class="brand-icon">🏭</span>
          <h1>Labour Platform</h1>
          <p>Uber for Blue-Collar Workers</p>
        </div>

        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="admin@company.in" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>

          <button type="submit" class="login-btn" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="demo-hint">
          <strong>Demo:</strong> admin&#64;labourplatform.in / password123
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; background: linear-gradient(135deg, #1a1a2e, #16213e);
      display: flex; align-items: center; justify-content: center;
    }
    .login-box {
      background: white; border-radius: 16px; padding: 40px;
      width: 400px; max-width: 90vw;
    }
    .brand { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 48px; }
    .brand h1 { margin: 8px 0 4px; color: #1a1a2e; }
    .brand p { color: #666; margin: 0; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .form-group input {
      width: 100%; padding: 12px; border: 1px solid #ddd;
      border-radius: 8px; font-size: 14px; box-sizing: border-box;
    }
    .login-btn {
      width: 100%; padding: 14px; background: #e94560; color: white;
      border: none; border-radius: 8px; font-size: 16px; font-weight: 600;
      cursor: pointer; margin-top: 8px;
    }
    .login-btn:hover { background: #c0392b; }
    .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #e94560; font-size: 13px; margin-bottom: 8px; }
    .demo-hint { margin-top: 20px; text-align: center; font-size: 13px; color: #999; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Invalid email or password';
        this.loading = false;
      },
    });
  }
}
