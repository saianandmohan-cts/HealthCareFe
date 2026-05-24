import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddPrescription {
  private http = inject(HttpClient);
  
  // Clean endpoint structure pointing to doctor route layout
  private apiUrl = 'http://localhost:5000/doctor/consultations';

  /**
   * New prescription data ko database mein save karne ke liye
   * @param formData Form ka poora JSON data
   */
  savePrescription(formData: any): Observable<any> {
    // ✅ EASY & CLEAN FIX: LocalStorage aur headers ki koi zaroorat nahi h!
    // Cookies automatically withCredentials ke sath backend par transfer ho jayengi.
    return this.http.post<any>(this.apiUrl, formData, { 
      withCredentials: true 
    });
  }
}