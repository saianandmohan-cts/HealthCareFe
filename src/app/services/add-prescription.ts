import {inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddPrescription {
  private http = inject(HttpClient);
  
  // Aapki Node.js/Express backend ka base URL
  private apiUrl = 'http://localhost:5000/api/consultations';

  /**
   * New prescription data ko database mein save karne ke liye
   * @param formData Form ka poora JSON data
   */
  savePrescription(formData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData, {withCredentials:true});
  }
}
