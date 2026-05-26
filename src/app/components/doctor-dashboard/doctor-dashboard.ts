import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PastConsultation } from '../past-consultation/past-consultation';
import { DoctorAvailabilitySlot } from '../doctor-availability-slot/doctor-availability-slot';
import { DoctorService } from '../../services/doctor.service';
import { Appointment } from '../../models/appointment.model';
import { Doctor } from '../../models/doctor.model';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'; 
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, PastConsultation, DoctorAvailabilitySlot],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
})
export class DoctorDashboard implements OnInit {
  docService = inject(DoctorService);
  auth = inject(Auth);

  DoctorInfo$!: Observable<Doctor>;
  upcomingAppointments$!: Observable<Appointment[]>;

  flag: number = 1; 
  selectedConsultation: string | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private parseDateTime(dateStr: string, timeStr: string): Date {
    const baseDate = new Date(dateStr);
    if (!timeStr) return baseDate;
    const timeMatch = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!timeMatch) return baseDate;
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  }

  private loadDashboardData(): void {
    this.DoctorInfo$ = this.docService.getDoctor().pipe(
      map((res: any) => res.data) 
    );
    
    const now = new Date();

    this.upcomingAppointments$ = this.docService.getUpcomingAppointments().pipe(
      switchMap((appointments: any[]) => {
        const rawList = appointments || [];
        const updateObservables: Observable<any>[] = [];

        rawList.forEach((appt: any) => {
          if (appt.status && appt.status.toLowerCase() === 'scheduled') {
            const apptTimestamp = this.parseDateTime(appt.date, appt.time).getTime();
            if (apptTimestamp < now.getTime()) {
              updateObservables.push(this.docService.markAppointmentAsCompleted(appt.appointmentId));
            }
          }
        });

        if (updateObservables.length > 0) {
          return forkJoin(updateObservables).pipe(
            switchMap(() => this.docService.getUpcomingAppointments()),
            map((freshAppointments: any[]) => freshAppointments || [])
          );
        }

        return of(rawList);
      }),
      map((appointments: any[]) => {
        return appointments
          .filter((appt: any) => {
            if (!appt.status || appt.status.toLowerCase() !== 'scheduled') {
              return false;
            }
            const apptDate = new Date(appt.date);
            const apptTimestamp = this.parseDateTime(appt.date, appt.time).getTime();
            
            if (this.isSameDay(apptDate, now)) {
              return apptTimestamp >= now.getTime();
            }
            return apptDate.getTime() > now.getTime();
          })
          .sort((a: any, b: any) => {
            return this.parseDateTime(a.date, a.time).getTime() - this.parseDateTime(b.date, b.time).getTime();
          });
      })
    );
  }

  toggleConsultation(appointmentId: string): void {
    this.selectedConsultation =
      this.selectedConsultation === appointmentId ? null : appointmentId;
  }

  viewUpcoming(): void {
    this.flag = 1;
  }

  viewPast(): void {
    this.flag = 2;
  }

  editAvailability(): void {
    this.flag = 3;
  }

  onLogout(): void {
    this.auth.logout();
  }

  cancelAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) { 
      this.docService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }
}