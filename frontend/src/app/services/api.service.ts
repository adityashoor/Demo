import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Auth
  login(email: string, password: string) {
    return this.http.post<{ token: string; user: any }>(`${this.base}/auth/login`, { email, password });
  }

  // Analytics
  getOverview(): Observable<any> {
    return this.http.get(`${this.base}/analytics/overview`);
  }
  getFulfillmentTrend(days = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/analytics/fulfillment-trend?days=${days}`);
  }
  getTopWorkers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/analytics/top-workers`);
  }
  getDemandPrediction(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/analytics/demand-prediction`);
  }

  // Workers
  getWorkers(params?: any): Observable<any> {
    return this.http.get(`${this.base}/workers`, { params });
  }
  getWorker(id: string): Observable<any> {
    return this.http.get(`${this.base}/workers/${id}`);
  }
  createWorker(data: any): Observable<any> {
    return this.http.post(`${this.base}/workers`, data);
  }
  updateWorker(id: string, data: any): Observable<any> {
    return this.http.put(`${this.base}/workers/${id}`, data);
  }
  getWorkerStats(): Observable<any> {
    return this.http.get(`${this.base}/workers/stats`);
  }
  getAvailableWorkers(skill?: string, city?: string): Observable<any[]> {
    let params: any = {};
    if (skill) params.skill = skill;
    if (city) params.city = city;
    return this.http.get<any[]>(`${this.base}/workers/available`, { params });
  }

  // Businesses
  getBusinesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/businesses`);
  }
  createBusiness(data: any): Observable<any> {
    return this.http.post(`${this.base}/businesses`, data);
  }

  // Bookings
  getBookings(params?: any): Observable<any> {
    return this.http.get(`${this.base}/bookings`, { params });
  }
  getBooking(id: string): Observable<any> {
    return this.http.get(`${this.base}/bookings/${id}`);
  }
  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.base}/bookings`, data);
  }
  getTodaysBookings(): Observable<any> {
    return this.http.get(`${this.base}/bookings/today`);
  }

  // Attendance
  markAttendanceBulk(bookingId: string, records: any[]): Observable<any> {
    return this.http.post(`${this.base}/attendance/booking/${bookingId}/bulk`, records);
  }
  getDailyAttendance(date: string): Observable<any> {
    return this.http.get(`${this.base}/attendance/report/daily?date=${date}`);
  }
  getBookingAttendance(bookingId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/attendance/booking/${bookingId}`);
  }

  // Payroll
  getPayrollPending(): Observable<any> {
    return this.http.get(`${this.base}/payroll/pending`);
  }
  generatePayroll(bookingId: string): Observable<any> {
    return this.http.post(`${this.base}/payroll/generate/booking/${bookingId}`, {});
  }
  markPayrollPaid(ids: string[], method: string): Observable<any> {
    return this.http.post(`${this.base}/payroll/mark-paid`, { ids, method });
  }
  getWorkerPayroll(workerId: string): Observable<any> {
    return this.http.get(`${this.base}/payroll/worker/${workerId}`);
  }

  // Supervisors
  getSupervisors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/supervisors`);
  }
  createSupervisor(data: any): Observable<any> {
    return this.http.post(`${this.base}/supervisors`, data);
  }
}
