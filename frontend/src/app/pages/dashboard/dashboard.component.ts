import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <div class="today-date">{{ today | date:'EEEE, d MMMM yyyy' }}</div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="overview">
        <div class="kpi-card blue">
          <div class="kpi-icon">👷</div>
          <div class="kpi-data">
            <div class="kpi-value">{{ overview.workers?.total || 0 }}</div>
            <div class="kpi-label">Total Workers</div>
          </div>
          <div class="kpi-sub">{{ overview.workers?.available || 0 }} available</div>
        </div>

        <div class="kpi-card green">
          <div class="kpi-icon">✅</div>
          <div class="kpi-data">
            <div class="kpi-value">{{ overview.workers?.utilization || 0 }}%</div>
            <div class="kpi-label">Utilization Rate</div>
          </div>
          <div class="kpi-sub">Today</div>
        </div>

        <div class="kpi-card orange">
          <div class="kpi-icon">📋</div>
          <div class="kpi-data">
            <div class="kpi-value">{{ overview.bookings?.today || 0 }}</div>
            <div class="kpi-label">Bookings Today</div>
          </div>
          <div class="kpi-sub">{{ overview.bookings?.thisMonth || 0 }} this month</div>
        </div>

        <div class="kpi-card red">
          <div class="kpi-icon">💰</div>
          <div class="kpi-data">
            <div class="kpi-value">₹{{ (overview.payroll?.pendingAmount || 0) | number:'1.0-0' }}</div>
            <div class="kpi-label">Pending Payroll</div>
          </div>
          <div class="kpi-sub"><a routerLink="/payroll">Process now →</a></div>
        </div>
      </div>

      <!-- Today's Bookings -->
      <div class="section" *ngIf="todaysSummary">
        <div class="section-header">
          <h2>Today's Operations</h2>
          <a routerLink="/bookings/new" class="btn btn-primary">+ New Booking</a>
        </div>

        <div class="today-stats">
          <div class="stat-bar">
            <span>Workers Required: <strong>{{ todaysSummary.workersRequired }}</strong></span>
            <span>Confirmed: <strong>{{ todaysSummary.workersConfirmed }}</strong></span>
            <span>Present: <strong class="green-text">{{ todaysSummary.workersPresent }}</strong></span>
            <span>Fulfillment: <strong>{{ todaysSummary.fulfillmentRate }}%</strong></span>
          </div>
          <div class="fulfillment-bar">
            <div class="fill" [style.width.%]="todaysSummary.fulfillmentRate"
                 [style.background]="todaysSummary.fulfillmentRate >= 80 ? '#4caf50' : todaysSummary.fulfillmentRate >= 50 ? '#ff9800' : '#f44336'">
            </div>
          </div>
        </div>

        <table class="table" *ngIf="todaysSummary.bookings?.length">
          <thead>
            <tr>
              <th>Business</th>
              <th>Shift</th>
              <th>Required</th>
              <th>Present</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of todaysSummary.bookings">
              <td>{{ b.business?.name || '—' }}</td>
              <td>{{ b.shiftType }}</td>
              <td>{{ b.workersRequired }}</td>
              <td>{{ b.workersPresent }}</td>
              <td><span class="badge" [class]="'badge-' + b.status">{{ b.status }}</span></td>
              <td>
                <a [routerLink]="['/attendance']" [queryParams]="{bookingId: b.id}" class="link">
                  Mark Attendance
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty" *ngIf="!todaysSummary.bookings?.length">
          No bookings today. <a routerLink="/bookings/new">Create one</a>
        </div>
      </div>

      <!-- Top Workers -->
      <div class="section" *ngIf="topWorkers?.length">
        <div class="section-header">
          <h2>⭐ Top Reliable Workers</h2>
          <a routerLink="/workers" class="link">View all</a>
        </div>
        <div class="workers-grid">
          <div class="worker-card" *ngFor="let w of topWorkers.slice(0, 6)">
            <div class="worker-avatar">👷</div>
            <div class="worker-info">
              <div class="worker-name">{{ w.name }}</div>
              <div class="worker-phone">📞 {{ w.phone }}</div>
              <div class="worker-score">
                <span class="stars">⭐ {{ w.reliabilityScore }}/5</span>
                <span class="shifts">{{ w.totalShiftsCompleted }} shifts</span>
              </div>
              <span class="badge" [class]="'badge-' + w.status">{{ w.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Demand Prediction -->
      <div class="section" *ngIf="predictions?.length">
        <div class="section-header">
          <h2>🔮 Demand Forecast (Next 7 Days)</h2>
        </div>
        <div class="prediction-row">
          <div class="prediction-card" *ngFor="let p of predictions">
            <div class="pred-day">{{ p.dayOfWeek }}</div>
            <div class="pred-date">{{ p.date | date:'d MMM' }}</div>
            <div class="pred-count">{{ p.predictedDemand }}</div>
            <div class="pred-label">workers</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 28px; }
    .today-date { color: #666; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      border-radius: 12px; padding: 20px; color: white;
      display: flex; flex-direction: column; gap: 8px;
    }
    .kpi-card.blue { background: linear-gradient(135deg, #1a73e8, #0d47a1); }
    .kpi-card.green { background: linear-gradient(135deg, #4caf50, #2e7d32); }
    .kpi-card.orange { background: linear-gradient(135deg, #ff9800, #e65100); }
    .kpi-card.red { background: linear-gradient(135deg, #e94560, #b71c1c); }
    .kpi-icon { font-size: 32px; }
    .kpi-value { font-size: 32px; font-weight: 700; }
    .kpi-label { font-size: 14px; opacity: 0.9; }
    .kpi-sub { font-size: 13px; opacity: 0.8; }
    .kpi-sub a { color: white; }

    .section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; }

    .today-stats { margin-bottom: 16px; }
    .stat-bar { display: flex; gap: 24px; margin-bottom: 8px; font-size: 14px; }
    .green-text { color: #4caf50; }
    .fulfillment-bar { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
    .fill { height: 100%; border-radius: 4px; transition: width 0.5s; }

    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table th { padding: 10px; background: #f8f8f8; text-align: left; font-weight: 600; }
    .table td { padding: 10px; border-top: 1px solid #eee; }

    .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-confirmed, .badge-available { background: #e8f5e9; color: #2e7d32; }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-in_progress, .badge-working { background: #e3f2fd; color: #1565c0; }
    .badge-completed { background: #f3e5f5; color: #6a1b9a; }
    .badge-cancelled, .badge-suspended { background: #ffebee; color: #b71c1c; }
    .badge-unavailable { background: #f5f5f5; color: #616161; }
    .badge-partial { background: #fff8e1; color: #f57f17; }

    .btn { padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #e94560; color: white; }
    .link { color: #1a73e8; text-decoration: none; font-size: 14px; }

    .workers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .worker-card { border: 1px solid #eee; border-radius: 8px; padding: 12px; display: flex; gap: 12px; }
    .worker-avatar { font-size: 32px; }
    .worker-name { font-weight: 600; }
    .worker-phone { font-size: 13px; color: #666; margin: 2px 0; }
    .worker-score { display: flex; gap: 8px; font-size: 13px; margin-bottom: 4px; }
    .shifts { color: #666; }

    .prediction-row { display: flex; gap: 12px; overflow-x: auto; }
    .prediction-card {
      min-width: 90px; text-align: center; background: #f8f9fa;
      border-radius: 10px; padding: 12px;
    }
    .pred-day { font-weight: 700; font-size: 14px; color: #e94560; }
    .pred-date { font-size: 12px; color: #666; margin-bottom: 8px; }
    .pred-count { font-size: 28px; font-weight: 700; color: #1a1a2e; }
    .pred-label { font-size: 12px; color: #666; }

    .empty { text-align: center; color: #999; padding: 20px; }
    .empty a { color: #1a73e8; }

    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .workers-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  overview: any;
  todaysSummary: any;
  topWorkers: any[] = [];
  predictions: any[] = [];
  today = new Date();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getOverview().subscribe(d => this.overview = d);
    this.api.getTodaysBookings().subscribe(d => this.todaysSummary = d);
    this.api.getTopWorkers().subscribe(d => this.topWorkers = d);
    this.api.getDemandPrediction().subscribe(d => this.predictions = d);
  }
}
