import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>💰 Payroll</h1>
      </div>

      <div class="summary-card" *ngIf="pending">
        <div class="sum-grid">
          <div class="sum-item">
            <div class="sum-val">₹{{ pending.totalPending | number:'1.0-0' }}</div>
            <div class="sum-lbl">Total Pending</div>
          </div>
          <div class="sum-item">
            <div class="sum-val">{{ pending.workerCount }}</div>
            <div class="sum-lbl">Workers to Pay</div>
          </div>
          <div class="sum-item">
            <div class="sum-val">{{ selectedIds.length }}</div>
            <div class="sum-lbl">Selected</div>
          </div>
        </div>

        <div class="pay-actions" *ngIf="selectedIds.length > 0">
          <select [(ngModel)]="payMethod">
            <option value="cash">💵 Cash</option>
            <option value="upi">📱 UPI</option>
            <option value="bank_transfer">🏦 Bank Transfer</option>
          </select>
          <button class="btn btn-primary" (click)="markPaid()">
            Pay Selected (₹{{ selectedTotal | number:'1.0-0' }})
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th><input type="checkbox" (change)="toggleAll($event)" /></th>
              <th>Worker</th>
              <th>Work Date</th>
              <th>Base Wage</th>
              <th>Overtime</th>
              <th>Advance</th>
              <th>Deductions</th>
              <th>Net Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of pending?.records">
              <td>
                <input type="checkbox" [checked]="selectedIds.includes(r.id)"
                       (change)="toggleSelect(r)" />
              </td>
              <td>{{ r.worker?.name }}</td>
              <td>{{ r.workDate | date:'d MMM' }}</td>
              <td>₹{{ r.baseWage }}</td>
              <td>₹{{ r.overtime || 0 }}</td>
              <td>₹{{ r.advance || 0 }}</td>
              <td>₹{{ r.deductions || 0 }}</td>
              <td><strong>₹{{ r.netAmount }}</strong></td>
              <td><span class="badge badge-pending">pending</span></td>
            </tr>
          </tbody>
        </table>
        <div class="empty" *ngIf="!pending?.records?.length">No pending payroll. All paid! 🎉</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h1 { margin: 0; }
    .summary-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .sum-grid { display: flex; gap: 32px; margin-bottom: 16px; }
    .sum-val { font-size: 28px; font-weight: 700; color: #e94560; }
    .sum-lbl { font-size: 13px; color: #666; }
    .pay-actions { display: flex; gap: 12px; align-items: center; }
    .pay-actions select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .table-container { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .table th { padding: 10px; background: #f8f8f8; text-align: left; }
    .table td { padding: 10px; border-top: 1px solid #eee; }
    .badge-pending { background: #fff3e0; color: #e65100; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; }
    .btn-primary { background: #e94560; color: white; }
    .empty { text-align: center; color: #999; padding: 40px; }
  `]
})
export class PayrollComponent implements OnInit {
  pending: any;
  selectedIds: string[] = [];
  payMethod = 'cash';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPayrollPending().subscribe(d => this.pending = d);
  }

  get selectedTotal(): number {
    if (!this.pending?.records) return 0;
    return this.pending.records
      .filter((r: any) => this.selectedIds.includes(r.id))
      .reduce((sum: number, r: any) => sum + Number(r.netAmount), 0);
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.pending.records.map((r: any) => r.id);
    } else {
      this.selectedIds = [];
    }
  }

  toggleSelect(record: any) {
    const idx = this.selectedIds.indexOf(record.id);
    if (idx >= 0) this.selectedIds.splice(idx, 1);
    else this.selectedIds.push(record.id);
  }

  markPaid() {
    this.api.markPayrollPaid(this.selectedIds, this.payMethod).subscribe(() => {
      this.selectedIds = [];
      this.api.getPayrollPending().subscribe(d => this.pending = d);
    });
  }
}
