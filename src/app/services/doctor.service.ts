import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';
import { Doctor } from '../models/doctor.model';

const DOCTORS: any[] = [];

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private httpClient = inject(HttpClient);

  public refreshPastConsultations$ = new BehaviorSubject<boolean>(true);
  private upcomingRefresh$ = new BehaviorSubject<boolean>(true); 

  triggerPastRefresh(): void {
    this.refreshPastConsultations$.next(true);
  }

  triggerUpcomingRefresh(): void {
    this.upcomingRefresh$.next(true);
  }

  constructor() {}

  deleteAppointment(appointmentId: string): Observable<any> {
    return this.httpClient.delete<any>(
      `http://localhost:5000/doctor/deleteAppointment/${appointmentId}`, 
      { withCredentials: true }
    );
  }

  markAppointmentAsCompleted(appointmentId: string): Observable<any> {
    return this.httpClient.patch<any>(
      `http://localhost:5000/doctor/markAsCompleted/${appointmentId}`,
      {},
      { withCredentials: true }
    );
  }

  getAllDoctors(): Observable<any> {
    return this.httpClient.get<Doctor[]>('http://localhost:5000/doctor/allDoctor');
  }

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

  getUpcomingAppointments(): Observable<Appointment[]> {
    return this.upcomingRefresh$.pipe(
      switchMap(() => 
        this.httpClient.get<any>('http://localhost:5000/doctor/upcomingAppointments', { withCredentials: true })
      ),
      map((res: any) => res.data || res) // API wrapper clean handler
    );
  }
  
  getPastAppointments(): Observable<Appointment[]> {
    return this.httpClient.get<Appointment[]>(
      'http://localhost:5000/doctor/pastAppointments', 
      { withCredentials: true }
    );
  }
}