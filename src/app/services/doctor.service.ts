import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Doctor } from '../models/doctor.model';
import { Appointment } from '../models/appointment.model';
import { HttpClient } from '@angular/common/http';

// Dead mock reference safely bypassed
const DOCTORS: any[] = [];

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private httpClient = inject(HttpClient);

  constructor() {}

  /**
   * ✅ FIXED: Secure HttpOnly Cookie pass karne ke liye withCredentials add kiya
   */
  deleteAppointment(appointmentId: string): Observable<any> {
    return this.httpClient.delete<any>(
      `http://localhost:5000/doctor/deleteAppointment/${appointmentId}`, 
      { withCredentials: true }
    );
  }

  getAllDoctors(): Observable<any> {
    return this.httpClient.get<Doctor[]>('http://localhost:5000/doctor/allDoctor');
  }

  /**
   * ✅ FIXED: Logged-in doctor ka profile context fetch karne ke liye pipeline strict kiya
   */
  getDoctor(): Observable<Doctor> {
    return this.httpClient.get<Doctor>(
      `http://localhost:5000/doctor/getDoctor`, 
      { withCredentials: true }
    );
  }

  getDoctorById(id: number | string): Observable<Doctor> {
    return this.httpClient.get<Doctor>(`http://localhost:5000/doctor/getDoctorById/${id}`);
  }

  getDoctorsByDepartment(department: string): Doctor[] {
    return DOCTORS.filter((d: any) => d.department === department);
  }

  getDoctorsByExperience(minExperience: number): Doctor[] {
    return DOCTORS.filter((d: any) => d.experience >= minExperience);
  }

  /**
   * ✅ FIXED: Upcoming aur Past dono endpoints par withCredentials toggle sync kiya
   */
  getUpcomingAppointments(): Observable<Appointment[]> {
    return this.httpClient.get<Appointment[]>(
      'http://localhost:5000/doctor/upcomingAppointments', 
      { withCredentials: true }
    );
  }
  
  getPastAppointments(): Observable<Appointment[]> {
    return this.httpClient.get<Appointment[]>(
      'http://localhost:5000/doctor/pastAppointments', 
      { withCredentials: true }
    );
  }
}