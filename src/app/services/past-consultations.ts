import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PastConsultations {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/patient';

  constructor() {}

  // ✅ FIXED: Target URL me session bypass kiya. Ab backend cookie se auto-resolve karega.
  listAll(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/session`, { withCredentials: true });
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