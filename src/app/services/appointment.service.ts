import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/patient'; // Backend patient base route

  constructor() {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAll`);
  }

  getById(appointmentId: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/getById/${appointmentId}`, { withCredentials: true });
  }

  getByPatientId(patientId: string | number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  getByDoctorId(doctorId: string | number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/doctor/${doctorId}`);
  }

  /**
   * New appointment document initialization
   */
  book(appointmentData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/book-appointment`, appointmentData, { withCredentials: true });
  }

  /**
   * Reschedule ya properties change karne ke liye PATCH trigger
   */
  update(appointmentId: string, updatedData: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/modify-appointment/${appointmentId}`, updatedData, { withCredentials: true });
  }

  /**
   * ✅ FIXED: Express backend workflow ke sath cancel operations ko sync kiya
   * Delete hitting ki jagah backend status code controller property override use karega
   */
  cancel(appointmentId: string): Observable<any> {
    const cancelPayload = { status: 'Cancelled' };
    return this.http.patch<any>(`${this.baseUrl}/modify-appointment/${appointmentId}`, cancelPayload, { withCredentials: true });
  }
}