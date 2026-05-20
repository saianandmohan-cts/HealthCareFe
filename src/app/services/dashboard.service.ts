import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 👈 HttpClient inject kiya direct hit ke liye
import { AuthService } from './auth.service';
import { Appointment } from '../models/appointment.model';
import { Observable, map, of } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private authService = inject(AuthService);
  private http = inject(HttpClient); // 👈 Direct HTTP client instance
  private baseUrl = 'http://localhost:5000/patient'; 

  constructor() {}

  getPatientContext() {
    return this.authService.getLoggedInPatient();
  }

  // ✅ Helper: Backend ke /dashboard/:patientId se complete array stream nikalna
  private getDashboardDataFromBackend(): Observable<any> {
    const patient = this.getPatientContext();
    const pId = patient ? (patient.patientId || (patient as any)._id || "1") : "1"; 
    
    // Seedha backend router mapping -> /patient/dashboard/:patientId
    return this.http.get<any>(`${this.baseUrl}/dashboard/${pId}`);
  }

  // ✅ FIX 1: Summary cards counts updated via real backend dashboard object
  getAppointmentSummary(): Observable<{ total: number; upcoming: number }> {
    return this.getDashboardDataFromBackend().pipe(
      map((res: any) => {
        // Backend se agar appointments array res.appointments me aa raha hai toh use filter karo
        const appointments: any[] = res.appointments || res.data?.appointments || [];
        return {
          total: appointments.length,
          upcoming: appointments.filter((a: any) => a.status === 'Scheduled').length
        };
      })
    );
  }

  // ✅ FIX 2: Nearest upcoming scheduled appointment directly linked
  getUpcomingAppointment(): Observable<Appointment | null> {
    return this.getDashboardDataFromBackend().pipe(
      map((res: any) => {
        const appointments: any[] = res.appointments || res.data?.appointments || [];
        const upcoming = appointments
          .filter((a: any) => a.status === 'Scheduled')
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return upcoming.length ? upcoming[0] : null;
      })
    );
  }
}