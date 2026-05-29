import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddPrescription {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost:5000/doctor/consultations';


  savePrescription(formData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData, { 
      withCredentials: true 
    });
  }
}