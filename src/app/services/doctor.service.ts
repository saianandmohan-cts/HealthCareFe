import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Doctor } from '../models/doctor.model';
import { Appointment } from '../models/appointment.model';
import { HttpClient } from '@angular/common/http';

// ✅ Dead mock reference ko bypass karne ke liye local empty array declare kiya
const DOCTORS: any[] = [];

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  httpClient = inject(HttpClient);

  constructor() {}

  deleteAppointment(appointmentId: string): Observable<any> {
    return this.httpClient.delete<any>(`http://localhost:5000/doctor/deleteAppointment/${appointmentId}`);
  }

  getAllDoctors() {
    return this.httpClient.get<Doctor[]>('http://localhost:5000/doctor/allDoctor');
  }

  // Get the loggedIn doctors-Sahil
  getDoctor(): Observable<Doctor> {
    return this.httpClient.get<Doctor>(`http://localhost:5000/doctor/getDoctor`);
  }

  getDoctorById(id: number | string): Observable<Doctor> {
    return this.httpClient.get<Doctor>(`http://localhost:5000/doctor/getDoctorById/${id}`);
  }

  // Get doctors by department
  getDoctorsByDepartment(department: string): Doctor[] {
    // ✅ Parameter 'd' ko explicit 'any' type diya
    return DOCTORS.filter((d: any) => d.department === department);
  }

  // Get doctors by experience (minimum years)
  getDoctorsByExperience(minExperience: number): Doctor[] {
    // ✅ Parameter 'd' ko explicit 'any' type diya
    return DOCTORS.filter((d: any) => d.experience >= minExperience);
  }

  getUpcomingAppointments(): Observable<Appointment[]>{
    return this.httpClient.get<Appointment[]>('http://localhost:5000/doctor/upcomingAppointments');
  }
  
  getPastAppointments(): Observable<Appointment[]>{
    return this.httpClient.get<Appointment[]>('http://localhost:5000/doctor/pastAppointments');
  }
}