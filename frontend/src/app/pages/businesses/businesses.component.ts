import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-businesses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🏢 Businesses</h1>
        <button class="btn btn-primary" (click)="showForm = true">+ Add Business</button>
      </div>

      <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Add New Business</h3>
          <form (ngSubmit)="createBusiness()">
            <div class="form-group"><label>Business Name *</label><input [(ngModel)]="newBiz.name" name="name" required /></div>
            <div class="form-group"><label>Contact Person</label><input [(ngModel)]="newBiz.contactPersonName" name="person" /></div>
            <div class="form-group"><label>Phone *</label><input [(ngModel)]="newBiz.contactPhone" name="phone" required /></div>
            <div class="form-group"><label>Email</label><input [(ngModel)]="newBiz.contactEmail" name="email" /></div>
            <div class="form-group"><label>Type</label>
              <select [(ngModel)]="newBiz.type" name="type">
                <option value="factory">Factory</option>
                <option value="warehouse">Warehouse</option>
                <option value="sme">SME</option>
              </select>
            </div>
            <div class="form-group"><label>City</label><input [(ngModel)]="newBiz.city" name="city" /></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Business</button>
            </div>
          </form>
        </div>
      </div>

      <div class="grid">
        <div class="biz-card" *ngFor="let b of businesses">
          <div class="biz-icon">🏢</div>
          <div class="biz-info">
            <div class="biz-name">{{ b.name }}</div>
            <div class="biz-type">{{ b.type | titlecase }}</div>
            <div class="biz-meta">📞 {{ b.contactPhone }}</div>
            <div class="biz-meta">📍 {{ b.city || 'City not set' }}</div>
            <div class="biz-meta" *ngIf="b.contactPersonName">👤 {{ b.contactPersonName }}</div>
            <span class="badge badge-verified" *ngIf="b.isVerified">✅ Verified</span>
          </div>
        </div>
        <div class="empty" *ngIf="!businesses.length">No businesses yet.</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .biz-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; gap: 12px; }
    .biz-icon { font-size: 36px; }
    .biz-name { font-size: 16px; font-weight: 700; }
    .biz-type { font-size: 12px; color: #e94560; font-weight: 500; margin-bottom: 6px; }
    .biz-meta { font-size: 13px; color: #555; margin: 2px 0; }
    .badge-verified { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 24px; width: 420px; }
    .modal h3 { margin: 0 0 16px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .form-group label { font-size: 13px; font-weight: 600; }
    .form-group input, .form-group select { padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; }
    .btn-primary { background: #e94560; color: white; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .empty { text-align: center; color: #999; padding: 40px; grid-column: 1/-1; }
  `]
})
export class BusinessesComponent implements OnInit {
  businesses: any[] = [];
  showForm = false;
  newBiz: any = { type: 'factory' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getBusinesses().subscribe(d => this.businesses = d);
  }

  createBusiness() {
    this.api.createBusiness(this.newBiz).subscribe(() => {
      this.showForm = false;
      this.newBiz = { type: 'factory' };
      this.api.getBusinesses().subscribe(d => this.businesses = d);
    });
  }
}
