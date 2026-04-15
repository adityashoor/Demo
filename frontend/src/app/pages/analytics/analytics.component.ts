import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>📈 Analytics</h1>
      </div>

      <!-- Skill Demand -->
      <div class="section">
        <h2>Skill Demand Analysis</h2>
        <div class="skill-bars" *ngIf="skillDemand?.length">
          <div class="skill-bar" *ngFor="let s of skillDemand">
            <div class="skill-name">{{ s.skill | titlecase }}</div>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="(s.count / maxSkillCount) * 100"></div>
            </div>
            <div class="skill-count">{{ s.count }} bookings</div>
          </div>
        </div>
      </div>

      <!-- Fulfillment Trend -->
      <div class="section">
        <h2>Fulfillment Rate — Last 30 Days</h2>
        <div class="trend-chart" *ngIf="trend?.length">
          <div class="trend-bars">
            <div class="trend-bar-wrapper" *ngFor="let t of trend">
              <div class="trend-bar"
                   [style.height.%]="t.fulfillmentRate"
                   [style.background]="t.fulfillmentRate >= 80 ? '#4caf50' : t.fulfillmentRate >= 50 ? '#ff9800' : '#f44336'"
                   [title]="t.date + ': ' + t.fulfillmentRate + '%'">
              </div>
              <div class="trend-label" *ngIf="shouldShowLabel($index)">{{ t.date | date:'d' }}</div>
            </div>
          </div>
          <div class="trend-legend">
            <span class="legend-item green">≥80% Good</span>
            <span class="legend-item orange">50–79% Average</span>
            <span class="legend-item red">&lt;50% Poor</span>
          </div>
        </div>
      </div>

      <!-- Demand Prediction -->
      <div class="section">
        <h2>🔮 Next 7 Days Forecast</h2>
        <div class="prediction-grid" *ngIf="predictions?.length">
          <div class="pred-card" *ngFor="let p of predictions">
            <div class="pred-day">{{ p.dayOfWeek }}</div>
            <div class="pred-date">{{ p.date | date:'d MMM' }}</div>
            <div class="pred-value">{{ p.predictedDemand }}</div>
            <div class="pred-unit">workers needed</div>
          </div>
        </div>
      </div>

      <!-- Top Workers -->
      <div class="section">
        <h2>⭐ Top 10 Reliable Workers</h2>
        <table class="table" *ngIf="topWorkers?.length">
          <thead>
            <tr>
              <th>#</th>
              <th>Worker</th>
              <th>Reliability Score</th>
              <th>Shifts Completed</th>
              <th>Attendance %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let w of topWorkers; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ w.name }}</td>
              <td>⭐ {{ w.reliabilityScore }}/5</td>
              <td>{{ w.totalShiftsCompleted }}</td>
              <td>{{ w.attendancePercentage || '—' }}%</td>
              <td><span class="badge" [class]="'badge-' + w.status">{{ w.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header h1 { margin: 0 0 24px; }
    .section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .section h2 { margin: 0 0 16px; font-size: 18px; }

    .skill-bars { display: flex; flex-direction: column; gap: 10px; }
    .skill-bar { display: flex; align-items: center; gap: 12px; }
    .skill-name { width: 120px; font-size: 14px; font-weight: 500; }
    .bar-track { flex: 1; height: 12px; background: #f0f0f0; border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; background: #e94560; border-radius: 6px; transition: width 0.5s; }
    .skill-count { width: 100px; font-size: 13px; color: #666; }

    .trend-chart { }
    .trend-bars { display: flex; align-items: flex-end; height: 120px; gap: 2px; }
    .trend-bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .trend-bar { width: 100%; min-height: 2px; border-radius: 2px 2px 0 0; transition: height 0.3s; }
    .trend-label { font-size: 10px; color: #999; margin-top: 4px; }
    .trend-legend { display: flex; gap: 16px; margin-top: 12px; font-size: 13px; }
    .legend-item { display: flex; align-items: center; gap: 4px; }
    .legend-item::before { content: ''; display: inline-block; width: 12px; height: 12px; border-radius: 2px; }
    .legend-item.green::before { background: #4caf50; }
    .legend-item.orange::before { background: #ff9800; }
    .legend-item.red::before { background: #f44336; }

    .prediction-grid { display: flex; gap: 12px; }
    .pred-card { flex: 1; text-align: center; background: #f8f9fa; border-radius: 10px; padding: 16px; }
    .pred-day { font-weight: 700; color: #e94560; }
    .pred-date { font-size: 12px; color: #666; margin-bottom: 8px; }
    .pred-value { font-size: 32px; font-weight: 700; }
    .pred-unit { font-size: 11px; color: #999; }

    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table th { padding: 10px; background: #f8f8f8; text-align: left; }
    .table td { padding: 10px; border-top: 1px solid #eee; }
    .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; }
    .badge-available { background: #e8f5e9; color: #2e7d32; }
    .badge-working { background: #e3f2fd; color: #1565c0; }
    .badge-unavailable { background: #f5f5f5; color: #616161; }
  `]
})
export class AnalyticsComponent implements OnInit {
  skillDemand: any[] = [];
  trend: any[] = [];
  predictions: any[] = [];
  topWorkers: any[] = [];

  get maxSkillCount(): number {
    return Math.max(...(this.skillDemand.map(s => Number(s.count)) || [1]));
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getSkillDemand().subscribe(d => this.skillDemand = d);
    this.api.getFulfillmentTrend(30).subscribe(d => this.trend = d);
    this.api.getDemandPrediction().subscribe(d => this.predictions = d);
    this.api.getTopWorkers().subscribe(d => this.topWorkers = d);
  }

  shouldShowLabel(index: number): boolean {
    return index % 5 === 0;
  }
}
