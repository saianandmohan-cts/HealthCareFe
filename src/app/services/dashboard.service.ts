import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Auth } from './auth';
import { Appointment } from '../models/appointment.model';
import { Observable, map } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private auth = inject(Auth);
  private http = inject(HttpClient); 
  private baseUrl = 'http://localhost:5000/patient'; 

  constructor() {}

  /**
   * Safe login session reading helper
   */
  getPatientContext() {
    return this.auth.getLoggedInPatient();
  }

  /**
   * ─── EASY BACKEND COUPLER STREAM ───
   * Direct login contexts se patient ID uthakar dashboard endpoint hit karega
   */
  private getDashboardDataFromBackend(): Observable<any> {
    const patient = this.getPatientContext();
    // Patient agar load ho gaya h, toh uski ID pass karo, nahi toh fallback "1" string
    const pId = patient?.patientId || "1"; 
    
    return this.http.get<any>(`${this.baseUrl}/dashboard/${pId}`, { withCredentials: true });
  }

  /**
   * ─── EASY SUMMARY WIDGET COUNT ───
   * Total aur Scheduled appointments ka basic filtering logic
   */
  getAppointmentSummary(): Observable<{ total: number; upcoming: number }> {
    return this.getDashboardDataFromBackend().pipe(
      map((res: any) => {
        // Backend key matching matrix parsing
        const appointments: any[] = res?.appointments || [];
        
        return {
          total: appointments.length,
          upcoming: appointments.filter(a => a.status === 'Scheduled').length
        };
      })
    );
  }

/**
   * ─── DYNAMIC NEXT UPCOMING APPOINTMENT DETECTOR ───
   * Jo date aur exact time wise sabse pehle hone wali scheduled appointment hai, wo nikalega
   */
  getUpcomingAppointment(): Observable<Appointment | null> {
    return this.getDashboardDataFromBackend().pipe(
      map((res: any) => {
        const appointments: any[] = res?.appointments || [];
        
        // 1. Sirf Scheduled appointments filter karein
        const scheduled = appointments.filter(a => a.status === 'Scheduled');
        
        if (scheduled.length === 0) return null;

        // 2. Exact Date aur Time ke basis par sort karein (Earliest first)
        scheduled.sort((a, b) => {
          const dateTimeA = new Date(`${a.date} ${a.time}`);
          const dateTimeB = new Date(`${b.date} ${b.time}`);
          return dateTimeA.getTime() - dateTimeB.getTime(); // Ascending order
        });

        return scheduled[0]; // Sabse pehle wali appointment return hogi
      })
    );
  }
}