import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ✅ HttpClient import kiya
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PastConsultations {
  // ✅ http aur baseUrl ko class properties ke roop mein inject aur declare kiya
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/patient';

  constructor() {}

listAll(patientId: string = '1'): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/dashboard/${patientId}`, { withCredentials: true });
}

  getPrescriptionById(consultationId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/view-prescription/${consultationId}`, { withCredentials: true });
  }

  // Real PDF Blob processing engine link
  downloadPrescriptionFile(consultationId: string | number): Observable<Blob> {
    // FIXED: withCredentials pass kiya taaki verifyPatient block na kare aur responseType blob map kiya
    return this.http.get(`${this.baseUrl}/download-prescription/${consultationId}`, {
      responseType: 'blob',
      withCredentials: true
    });
  }
}