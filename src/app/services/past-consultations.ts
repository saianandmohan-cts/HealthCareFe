import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class PastConsultations {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private baseUrl = 'http://localhost:5000/patient';

  constructor() {}

  listAll(): Observable<any> {
    const currentPatient = this.authService.currentUser() as any;
    const patientId = currentPatient?.patientId || 'session';
    
    return this.http.get<any>(`${this.baseUrl}/dashboard/${patientId}`, { withCredentials: true });
  }

  getPrescriptionById(consultationId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/view-prescription/${consultationId}`, { withCredentials: true });
  }

  downloadPrescriptionFile(consultationId: string | number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download-prescription/${consultationId}`, {
      responseType: 'blob', 
      withCredentials: true
    });
  }
}