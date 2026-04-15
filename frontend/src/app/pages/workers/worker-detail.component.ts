import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-worker-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page" *ngIf="worker">
      <div class="page-header">
        <a routerLink="/workers" class="back">← Workers</a>
        <h1>{{ worker.name }}</h1>
      </div>

      <div class="detail-grid">
        <div class="card profile">
          <div class="avatar">👷</div>
          <div class="name">{{ worker.name }}</div>
          <span class="badge" [class]="'badge-' + worker.status">{{ worker.status }}</span>
          <div class="score">⭐ {{ worker.reliabilityScore }}/5</div>
          <div class="meta">📞 {{ worker.phone }}</div>
          <div class="meta">📍 {{ worker.city || 'City not set' }}</div>
          <div class="meta">🔧 {{ worker.skills?.join(', ') }}</div>
          <div class="meta">💰 ₹{{ worker.dailyWageRate }}/day</div>
          <div class="meta">📱 {{ worker.hasSmartphone ? 'Smartphone' : 'Feature Phone' }}</div>
          <div class="meta">🗣️ {{ worker.preferredLanguage | titlecase }}</div>
        </div>

        <div class="stats-col">
          <div class="stat-card">
            <div class="stat-val">{{ worker.totalShiftsCompleted }}</div>
            <div class="stat-lbl">Shifts Completed</div>
          </div>
          <div class="stat-card red">
            <div class="stat-val">{{ worker.totalShiftsMissed }}</div>
            <div class="stat-lbl">Shifts Missed</div>
          </div>
          <div class="stat-card green">
            <div class="stat-val">{{ getAttendancePct() }}%</div>
            <div class="stat-lbl">Attendance Rate</div>
          </div>
        </div>
      </div>

      <div class="ratings-section" *ngIf="ratings?.length">
        <h3>Recent Ratings</h3>
        <div class="rating-card" *ngFor="let r of ratings">
          <div class="rating-header">
            <span>{{ r.business?.name }}</span>
            <span class="overall">⭐ {{ r.overallScore }}/5</span>
          </div>
          <div class="rating-breakdown">
            <span>Punctuality: {{ r.punctualityScore }}/5</span>
            <span>Quality: {{ r.qualityScore }}/5</span>
            <span>Behavior: {{ r.behaviorScore }}/5</span>
          </div>
          <div class="rating-comment" *ngIf="r.comment">{{ r.comment }}</div>
          <div class="rating-date">{{ r.createdAt | date:'d MMM yyyy' }}</div>
        </div>
      </div>

      <div class="payroll-section" *ngIf="payroll">
        <h3>Payroll Summary</h3>
        <div class="payroll-summary">
          <div class="p-item"><span>Total Earned</span><strong>₹{{ payroll.totalEarned | number:'1.0-0' }}</strong></div>
          <div class="p-item"><span>Total Paid</span><strong class="green">₹{{ payroll.totalPaid | number:'1.0-0' }}</strong></div>
          <div class="p-item"><span>Pending</span><strong class="red">₹{{ payroll.pending | number:'1.0-0' }}</strong></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { margin-bottom: 20px; }
    .back { color: #1a73e8; text-decoration: none; font-size: 14px; }
    .page-header h1 { margin: 8px 0 0; }
    .detail-grid { display: grid; grid-template-columns: 240px 1fr; gap: 16px; margin-bottom: 20px; }
    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .profile { text-align: center; }
    .avatar { font-size: 56px; }
    .name { font-size: 20px; font-weight: 700; margin: 8px 0 4px; }
    .score { font-size: 18px; margin: 8px 0; }
    .meta { font-size: 14px; color: #555; margin: 4px 0; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .badge-available { background: #e8f5e9; color: #2e7d32; }
    .badge-working { background: #e3f2fd; color: #1565c0; }
    .badge-unavailable { background: #f5f5f5; color: #616161; }
    .stats-col { display: flex; flex-direction: column; gap: 12px; }
    .stat-card { background: white; border-radius: 10px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-card.green .stat-val { color: #4caf50; }
    .stat-card.red .stat-val { color: #f44336; }
    .stat-val { font-size: 32px; font-weight: 700; }
    .stat-lbl { font-size: 13px; color: #666; }
    .ratings-section, .payroll-section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .rating-card { border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .rating-header { display: flex; justify-content: space-between; font-weight: 600; }
    .overall { color: #e94560; }
    .rating-breakdown { display: flex; gap: 16px; font-size: 13px; color: #666; margin-top: 6px; }
    .rating-comment { font-size: 13px; margin-top: 6px; font-style: italic; }
    .rating-date { font-size: 12px; color: #999; margin-top: 4px; }
    .payroll-summary { display: flex; gap: 24px; }
    .p-item { display: flex; flex-direction: column; gap: 4px; }
    .p-item span { font-size: 13px; color: #666; }
    .p-item strong { font-size: 20px; }
    .p-item strong.green { color: #4caf50; }
    .p-item strong.red { color: #f44336; }
  `]
})
export class WorkerDetailComponent implements OnInit {
  worker: any;
  ratings: any[] = [];
  payroll: any;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.api.getWorker(id).subscribe(w => this.worker = w);
    this.api.getWorkerPayroll(id).subscribe(p => this.payroll = p);
  }

  getAttendancePct(): number {
    if (!this.worker) return 0;
    const total = this.worker.totalShiftsCompleted + this.worker.totalShiftsMissed;
    if (total === 0) return 100;
    return Math.round((this.worker.totalShiftsCompleted / total) * 100);
  }
}
