import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>✅ Attendance</h1>
        <div class="date-picker">
          <input type="date" [(ngModel)]="selectedDate" (change)="loadDailyReport()" />
        </div>
      </div>

      <!-- Daily Summary -->
      <div class="summary-row" *ngIf="report">
        <div class="sum-card green">
          <div class="sum-val">{{ report.present }}</div>
          <div class="sum-lbl">Present</div>
        </div>
        <div class="sum-card red">
          <div class="sum-val">{{ report.absent }}</div>
          <div class="sum-lbl">Absent</div>
        </div>
        <div class="sum-card orange">
          <div class="sum-val">{{ report.late }}</div>
          <div class="sum-lbl">Late</div>
        </div>
        <div class="sum-card blue">
          <div class="sum-val">{{ report.total }}</div>
          <div class="sum-lbl">Total</div>
        </div>
      </div>

      <!-- Mark Attendance Panel -->
      <div class="mark-panel" *ngIf="selectedBookingId">
        <div class="panel-header">
          <h3>Mark Attendance for Booking</h3>
          <button class="btn btn-sm" (click)="selectedBookingId = ''">← Back</button>
        </div>

        <div class="worker-list" *ngIf="bookingWorkers.length">
          <div class="worker-row" *ngFor="let w of bookingWorkers">
            <span class="wname">{{ w.worker?.name || w.workerId }}</span>
            <div class="status-buttons">
              <button (click)="setStatus(w, 'present')" [class.active-present]="w.status === 'present'">✅ Present</button>
              <button (click)="setStatus(w, 'absent')" [class.active-absent]="w.status === 'absent'">❌ Absent</button>
              <button (click)="setStatus(w, 'late')" [class.active-late]="w.status === 'late'">⏰ Late</button>
              <button (click)="setStatus(w, 'half_day')" [class.active-half]="w.status === 'half_day'">½ Half</button>
            </div>
          </div>
          <button class="btn btn-primary" (click)="submitAttendance()">Save Attendance</button>
        </div>

        <div class="empty" *ngIf="!bookingWorkers.length">
          Loading workers...
        </div>
      </div>

      <!-- Daily Records Table -->
      <div class="table-container" *ngIf="!selectedBookingId">
        <table class="table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Business</th>
              <th>Status</th>
              <th>Check-in</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of report?.records">
              <td>{{ r.worker?.name }}</td>
              <td>{{ r.booking?.business?.name || '—' }}</td>
              <td><span class="badge" [class]="'badge-' + r.status">{{ r.status }}</span></td>
              <td>{{ r.checkInTime ? (r.checkInTime | date:'HH:mm') : '—' }}</td>
              <td>{{ r.checkInMethod }}</td>
            </tr>
          </tbody>
        </table>
        <div class="empty" *ngIf="!report?.records?.length">No attendance records for this date.</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { margin: 0; }
    .summary-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .sum-card { padding: 16px 24px; border-radius: 10px; color: white; text-align: center; }
    .sum-card.green { background: #4caf50; }
    .sum-card.red { background: #f44336; }
    .sum-card.orange { background: #ff9800; }
    .sum-card.blue { background: #1a73e8; }
    .sum-val { font-size: 32px; font-weight: 700; }
    .sum-lbl { font-size: 13px; opacity: 0.9; }
    .table-container { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table th { padding: 10px; background: #f8f8f8; text-align: left; }
    .table td { padding: 10px; border-top: 1px solid #eee; }
    .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; }
    .badge-present { background: #e8f5e9; color: #2e7d32; }
    .badge-absent { background: #ffebee; color: #b71c1c; }
    .badge-late { background: #fff3e0; color: #e65100; }
    .badge-half_day { background: #e3f2fd; color: #1565c0; }
    .mark-panel { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .panel-header h3 { margin: 0; }
    .worker-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .wname { font-weight: 500; }
    .status-buttons { display: flex; gap: 6px; }
    .status-buttons button { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; font-size: 13px; }
    .status-buttons button.active-present { background: #e8f5e9; border-color: #4caf50; }
    .status-buttons button.active-absent { background: #ffebee; border-color: #f44336; }
    .status-buttons button.active-late { background: #fff3e0; border-color: #ff9800; }
    .status-buttons button.active-half { background: #e3f2fd; border-color: #1a73e8; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; }
    .btn-primary { background: #e94560; color: white; margin-top: 16px; }
    .btn-sm { background: #f0f0f0; }
    .empty { text-align: center; color: #999; padding: 40px; }
  `]
})
export class AttendanceComponent implements OnInit {
  report: any;
  selectedDate = new Date().toISOString().split('T')[0];
  selectedBookingId = '';
  bookingWorkers: any[] = [];

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['bookingId']) {
        this.selectedBookingId = params['bookingId'];
        this.loadBookingWorkers();
      }
    });
    this.loadDailyReport();
  }

  loadDailyReport() {
    this.api.getDailyAttendance(this.selectedDate).subscribe(d => this.report = d);
  }

  loadBookingWorkers() {
    this.api.getBookingAttendance(this.selectedBookingId).subscribe(records => {
      this.bookingWorkers = records.map(r => ({ ...r, status: r.status || 'present' }));
    });
  }

  setStatus(worker: any, status: string) {
    worker.status = status;
  }

  submitAttendance() {
    const records = this.bookingWorkers.map(w => ({ workerId: w.workerId, status: w.status }));
    this.api.markAttendanceBulk(this.selectedBookingId, records).subscribe(() => {
      this.selectedBookingId = '';
      this.loadDailyReport();
    });
  }
}
