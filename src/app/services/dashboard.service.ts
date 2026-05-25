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


  getPatientContext() {
    return this.auth.getLoggedInPatient();
  }

  private getDashboardDataFromBackend(): Observable<any> {
    const patient = this.getPatientContext();
    const pId = patient?.patientId || "1"; 
    
    return this.http.get<any>(`${this.baseUrl}/dashboard/${pId}`, { withCredentials: true });
  }

  getAppointmentSummary(): Observable<{ total: number; upcoming: number }> {
    return this.getDashboardDataFromBackend().pipe(
      map((res: any) => {
        const appointments: any[] = res?.appointments || [];
        
        return {
          total: appointments.length,
          upcoming: appointments.filter(a => a.status === 'Scheduled').length
        };
      })
    );
  }

  getUpcomingAppointment(): Observable<Appointment | null> {
    return this.getDashboardDataFromBackend().pipe(
      map((res: any) => {
        const appointments: any[] = res?.appointments || [];
        
        const scheduled = appointments.filter(a => a.status === 'Scheduled');
        
        if (scheduled.length === 0) return null;

        scheduled.sort((a, b) => {
          const dateTimeA = new Date(`${a.date} ${a.time}`);
          const dateTimeB = new Date(`${b.date} ${b.time}`);
          return dateTimeA.getTime() - dateTimeB.getTime(); // Ascending order
        });

        return scheduled[0];
      })
    );
  }
}