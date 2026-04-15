import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-supervisors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🧑‍💼 Supervisors</h1>
        <button class="btn btn-primary" (click)="showForm = true">+ Add Supervisor</button>
      </div>

      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Add Supervisor</h3>
          <form (ngSubmit)="create()">
            <div class="form-group"><label>Name *</label><input [(ngModel)]="newSup.name" name="name" required /></div>
            <div class="form-group"><label>Phone *</label><input [(ngModel)]="newSup.phone" name="phone" required /></div>
            <div class="form-group"><label>City</label><input [(ngModel)]="newSup.city" name="city" /></div>
            <div class="form-group"><label>Max Workers Capacity</label><input type="number" [(ngModel)]="newSup.maxWorkerCapacity" name="cap" /></div>
            <div class="form-group"><label>Commission per worker/day (₹)</label><input type="number" [(ngModel)]="newSup.commissionRate" name="comm" /></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Add</button>
            </div>
          </form>
        </div>
      </div>

      <div class="grid">
        <div class="sup-card" *ngFor="let s of supervisors">
          <div class="sup-icon">🧑‍💼</div>
          <div class="sup-info">
            <div class="sup-name">{{ s.name }}</div>
            <div class="sup-meta">📞 {{ s.phone }}</div>
            <div class="sup-meta">📍 {{ s.city || '—' }}</div>
            <div class="sup-meta">👷 {{ s.workers?.length || 0 }}/{{ s.maxWorkerCapacity }} workers</div>
            <div class="sup-meta">💰 ₹{{ s.commissionRate }}/worker/day</div>
            <div class="sup-rating">⭐ {{ s.rating || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .sup-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; gap: 12px; }
    .sup-icon { font-size: 36px; }
    .sup-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .sup-meta { font-size: 13px; color: #555; margin: 2px 0; }
    .sup-rating { font-size: 14px; margin-top: 6px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 24px; width: 400px; }
    .modal h3 { margin: 0 0 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .form-group label { font-size: 13px; font-weight: 600; }
    .form-group input { padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; }
    .btn-primary { background: #e94560; color: white; }
    .btn-secondary { background: #f0f0f0; color: #333; }
  `]
})
export class SupervisorsComponent implements OnInit {
  supervisors: any[] = [];
  showForm = false;
  newSup: any = { maxWorkerCapacity: 25, commissionRate: 50 };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getSupervisors().subscribe(d => this.supervisors = d);
  }

  create() {
    this.api.createSupervisor(this.newSup).subscribe(() => {
      this.showForm = false;
      this.newSup = { maxWorkerCapacity: 25, commissionRate: 50 };
      this.api.getSupervisors().subscribe(d => this.supervisors = d);
    });
  }
}
