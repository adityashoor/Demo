import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>📋 Bookings</h1>
        <a routerLink="/bookings/new" class="btn btn-primary">+ New Booking</a>
      </div>

      <div class="today-box" *ngIf="today">
        <div class="today-kpis">
          <div class="kpi">
            <div class="k-val">{{ today.totalBookings }}</div>
            <div class="k-lbl">Today's Bookings</div>
          </div>
          <div class="kpi">
            <div class="k-val">{{ today.workersRequired }}</div>
            <div class="k-lbl">Workers Required</div>
          </div>
          <div class="kpi green">
            <div class="k-val">{{ today.workersPresent }}</div>
            <div class="k-lbl">Present</div>
          </div>
          <div class="kpi">
            <div class="k-val">{{ today.fulfillmentRate }}%</div>
            <div class="k-lbl">Fulfillment</div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <div class="filters">
          <select [(ngModel)]="filter.status" (change)="load()">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" [(ngModel)]="filter.date" (change)="load()" />
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Date</th>
              <th>Shift</th>
              <th>Skill</th>
              <th>Required</th>
              <th>Confirmed</th>
              <th>Present</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bookings">
              <td>{{ b.business?.name || '—' }}</td>
              <td>{{ b.shiftDate | date:'d MMM' }}</td>
              <td>{{ b.shiftType }}</td>
              <td>{{ b.skillRequired }}</td>
              <td>{{ b.workersRequired }}</td>
              <td>{{ b.workersConfirmed }}</td>
              <td>{{ b.workersPresent }}</td>
              <td><span class="badge" [class]="'badge-' + b.status">{{ b.status }}</span></td>
              <td>
                <a [routerLink]="['/attendance']" [queryParams]="{bookingId: b.id}" class="link">Attendance</a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty" *ngIf="!bookings.length">No bookings found.</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { margin: 0; }
    .today-box { background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .today-kpis { display: flex; gap: 32px; }
    .kpi { text-align: center; }
    .kpi.green .k-val { color: #4caf50; }
    .k-val { font-size: 28px; font-weight: 700; }
    .k-lbl { font-size: 12px; color: #666; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; }
    .filters select, .filters input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .table-container { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table th { padding: 10px; background: #f8f8f8; text-align: left; }
    .table td { padding: 10px; border-top: 1px solid #eee; }
    .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; }
    .badge-confirmed { background: #e8f5e9; color: #2e7d32; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-in_progress { background: #e3f2fd; color: #1565c0; }
    .badge-completed { background: #f3e5f5; color: #6a1b9a; }
    .badge-cancelled { background: #ffebee; color: #b71c1c; }
    .badge-partial { background: #fff8e1; color: #f57f17; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; }
    .btn-primary { background: #e94560; color: white; }
    .link { color: #1a73e8; text-decoration: none; font-size: 13px; }
    .empty { text-align: center; color: #999; padding: 40px; }
  `]
})
export class BookingsComponent implements OnInit {
  bookings: any[] = [];
  today: any;
  filter = { status: '', date: '', page: 1, limit: 20 };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getTodaysBookings().subscribe(d => this.today = d);
  }

  load() {
    const params: any = {};
    if (this.filter.status) params.status = this.filter.status;
    if (this.filter.date) params.date = this.filter.date;
    this.api.getBookings(params).subscribe(res => this.bookings = res.bookings || []);
  }
}
