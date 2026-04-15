import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/bookings" class="back">← Back</a>
        <h1>New Labour Booking</h1>
      </div>

      <div class="form-card">
        <form (ngSubmit)="submit()">
          <div class="form-section">
            <h3>Business Details</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Business *</label>
                <select [(ngModel)]="booking.businessId" name="business" required>
                  <option value="">Select Business</option>
                  <option *ngFor="let b of businesses" [value]="b.id">{{ b.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Supervisor (optional)</label>
                <select [(ngModel)]="booking.supervisorId" name="supervisor">
                  <option value="">Auto-assign best supervisor</option>
                  <option *ngFor="let s of supervisors" [value]="s.id">{{ s.name }} ({{ s.workers?.length || 0 }} workers)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Shift Details</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Shift Date *</label>
                <input type="date" [(ngModel)]="booking.shiftDate" name="date" required />
              </div>
              <div class="form-group">
                <label>Shift Type *</label>
                <select [(ngModel)]="booking.shiftType" name="shift" required>
                  <option value="morning">Morning (6am - 2pm)</option>
                  <option value="afternoon">Afternoon (2pm - 10pm)</option>
                  <option value="night">Night (10pm - 6am)</option>
                  <option value="full_day">Full Day (8am - 8pm)</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Workers Required *</label>
                <input type="number" [(ngModel)]="booking.workersRequired" name="workers" required min="1" />
              </div>
              <div class="form-group">
                <label>Skill Required</label>
                <select [(ngModel)]="booking.skillRequired" name="skill">
                  <option value="general">General</option>
                  <option value="packing">Packing</option>
                  <option value="loading">Loading</option>
                  <option value="unloading">Unloading</option>
                  <option value="manufacturing">Manufacturing</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Daily Wage Offered (₹)</label>
                <input type="number" [(ngModel)]="booking.dailyWageOffered" name="wage" />
              </div>
              <div class="form-group">
                <label>Location</label>
                <input [(ngModel)]="booking.location" name="location" placeholder="Factory/warehouse address" />
              </div>
            </div>
            <div class="form-group">
              <label>Special Instructions</label>
              <textarea [(ngModel)]="booking.instructions" name="notes" rows="3" placeholder="Any special requirements..."></textarea>
            </div>
          </div>

          <div class="available-preview" *ngIf="availableWorkers !== null">
            <span class="avail-icon">👷</span>
            <span><strong>{{ availableWorkers }}</strong> workers available for this skill & city</span>
          </div>

          <div class="form-actions">
            <a routerLink="/bookings" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              {{ submitting ? 'Creating...' : 'Create Booking' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 760px; }
    .page-header { margin-bottom: 20px; }
    .page-header h1 { margin: 8px 0 0; }
    .back { color: #1a73e8; text-decoration: none; font-size: 14px; }
    .form-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-section { margin-bottom: 24px; }
    .form-section h3 { margin: 0 0 16px; color: #e94560; font-size: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #333; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;
    }
    .form-group textarea { resize: vertical; }
    .available-preview {
      display: flex; align-items: center; gap: 8px;
      background: #e8f5e9; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;
      font-size: 14px;
    }
    .avail-icon { font-size: 20px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; }
    .btn-primary { background: #e94560; color: white; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class NewBookingComponent implements OnInit {
  businesses: any[] = [];
  supervisors: any[] = [];
  availableWorkers: number | null = null;
  submitting = false;
  booking: any = {
    shiftType: 'full_day',
    skillRequired: 'general',
    workersRequired: 10,
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getBusinesses().subscribe(d => this.businesses = d);
    this.api.getSupervisors().subscribe(d => this.supervisors = d);
  }

  submit() {
    this.submitting = true;
    this.api.createBooking(this.booking).subscribe({
      next: () => this.router.navigate(['/bookings']),
      error: () => this.submitting = false,
    });
  }
}
