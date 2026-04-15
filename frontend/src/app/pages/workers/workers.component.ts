import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-workers',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>👷 Workers</h1>
        <button class="btn btn-primary" (click)="showForm = true">+ Add Worker</button>
      </div>

      <!-- Stats -->
      <div class="stats-row" *ngIf="stats">
        <div class="stat">Total: <strong>{{ stats.total }}</strong></div>
        <div class="stat available">Available: <strong>{{ stats.available }}</strong></div>
        <div class="stat working">Working: <strong>{{ stats.working }}</strong></div>
        <div class="stat suspended">Suspended: <strong>{{ stats.suspended }}</strong></div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="filter.status" (change)="load()">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="working">Working</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select [(ngModel)]="filter.skill" (change)="load()">
          <option value="">All Skills</option>
          <option value="packing">Packing</option>
          <option value="loading">Loading</option>
          <option value="unloading">Unloading</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="general">General</option>
        </select>
        <input [(ngModel)]="filter.city" placeholder="Filter by city" (keyup.enter)="load()" />
      </div>

      <!-- Add Worker Form -->
      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Add New Worker</h3>
          <form (ngSubmit)="createWorker()" #f="ngForm">
            <div class="form-row">
              <div class="form-group">
                <label>Name *</label>
                <input [(ngModel)]="newWorker.name" name="name" required />
              </div>
              <div class="form-group">
                <label>Phone *</label>
                <input [(ngModel)]="newWorker.phone" name="phone" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Aadhaar (optional)</label>
                <input [(ngModel)]="newWorker.aadhaarNumber" name="aadhaar" />
              </div>
              <div class="form-group">
                <label>Daily Wage (₹)</label>
                <input type="number" [(ngModel)]="newWorker.dailyWageRate" name="wage" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>City</label>
                <input [(ngModel)]="newWorker.city" name="city" />
              </div>
              <div class="form-group">
                <label>Language</label>
                <select [(ngModel)]="newWorker.preferredLanguage" name="lang">
                  <option value="hindi">Hindi</option>
                  <option value="punjabi">Punjabi</option>
                  <option value="english">English</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Skills</label>
              <div class="checkbox-row">
                <label *ngFor="let s of skills">
                  <input type="checkbox" [value]="s" (change)="toggleSkill(s)" />
                  {{ s | titlecase }}
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>Has Smartphone?</label>
              <select [(ngModel)]="newWorker.hasSmartphone" name="phone_type">
                <option [value]="false">No (Feature Phone)</option>
                <option [value]="true">Yes</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Worker</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Score</th>
              <th>Shifts</th>
              <th>Supervisor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let w of workers">
              <td><a [routerLink]="['/workers', w.id]" class="link">{{ w.name }}</a></td>
              <td>{{ w.phone }}</td>
              <td>{{ w.skills?.join(', ') }}</td>
              <td><span class="badge" [class]="'badge-' + w.status">{{ w.status }}</span></td>
              <td>⭐ {{ w.reliabilityScore }}</td>
              <td>{{ w.totalShiftsCompleted }}</td>
              <td>{{ w.supervisor?.name || '—' }}</td>
              <td>
                <button class="btn-icon" title="Edit">✏️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty" *ngIf="!workers.length">No workers found.</div>

        <!-- Pagination -->
        <div class="pagination">
          <span>Total: {{ total }}</span>
          <button [disabled]="filter.page === 1" (click)="prevPage()">← Prev</button>
          <span>Page {{ filter.page }}</span>
          <button [disabled]="filter.page * filter.limit >= total" (click)="nextPage()">Next →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { margin: 0; }

    .stats-row { display: flex; gap: 20px; margin-bottom: 16px; }
    .stat { padding: 8px 16px; background: white; border-radius: 8px; font-size: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .stat.available strong { color: #4caf50; }
    .stat.working strong { color: #1a73e8; }
    .stat.suspended strong { color: #e94560; }

    .filters { display: flex; gap: 12px; margin-bottom: 16px; }
    .filters select, .filters input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }

    .table-container { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table th { padding: 10px; background: #f8f8f8; text-align: left; font-weight: 600; }
    .table td { padding: 10px; border-top: 1px solid #eee; }

    .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-available { background: #e8f5e9; color: #2e7d32; }
    .badge-working { background: #e3f2fd; color: #1565c0; }
    .badge-unavailable { background: #f5f5f5; color: #616161; }
    .badge-suspended { background: #ffebee; color: #b71c1c; }

    .btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #e94560; color: white; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; }
    .link { color: #1a73e8; text-decoration: none; font-weight: 500; }

    .pagination { display: flex; align-items: center; gap: 12px; margin-top: 16px; font-size: 14px; }
    .pagination button { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 24px; width: 560px; max-width: 90vw; }
    .modal h3 { margin: 0 0 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .form-group label { font-size: 13px; font-weight: 500; }
    .form-group input, .form-group select { padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .checkbox-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .checkbox-row label { display: flex; align-items: center; gap: 4px; font-size: 14px; cursor: pointer; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

    .empty { text-align: center; color: #999; padding: 40px; }
  `]
})
export class WorkersComponent implements OnInit {
  workers: any[] = [];
  stats: any;
  total = 0;
  showForm = false;
  skills = ['packing', 'loading', 'unloading', 'manufacturing', 'general'];
  filter = { status: '', skill: '', city: '', page: 1, limit: 20 };
  newWorker: any = { skills: [], hasSmartphone: false, preferredLanguage: 'hindi' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getWorkerStats().subscribe(s => this.stats = s);
  }

  load() {
    const params: any = { page: this.filter.page, limit: this.filter.limit };
    if (this.filter.status) params.status = this.filter.status;
    if (this.filter.skill) params.skill = this.filter.skill;
    if (this.filter.city) params.city = this.filter.city;

    this.api.getWorkers(params).subscribe(res => {
      this.workers = res.workers;
      this.total = res.total;
    });
  }

  toggleSkill(skill: string) {
    const idx = this.newWorker.skills.indexOf(skill);
    if (idx >= 0) this.newWorker.skills.splice(idx, 1);
    else this.newWorker.skills.push(skill);
  }

  createWorker() {
    this.api.createWorker(this.newWorker).subscribe(() => {
      this.showForm = false;
      this.newWorker = { skills: [], hasSmartphone: false, preferredLanguage: 'hindi' };
      this.load();
    });
  }

  prevPage() { if (this.filter.page > 1) { this.filter.page--; this.load(); } }
  nextPage() { this.filter.page++; this.load(); }
}
