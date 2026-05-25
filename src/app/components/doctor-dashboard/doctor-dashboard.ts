import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PastConsultation } from '../past-consultation/past-consultation';
import { DoctorAvailabilitySlot } from '../doctor-availability-slot/doctor-availability-slot';
import { DoctorService } from '../../services/doctor.service';
import { Appointment } from '../../models/appointment.model';
import { Doctor } from '../../models/doctor.model';
import { Observable } from 'rxjs';
// 1. Add map import here
import { map } from 'rxjs/operators'; 
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
  auth = inject(Auth)

  DoctorInfo$!: Observable<Doctor>;
  upcomingAppointments$!: Observable<Appointment[]>;

  flag: number = 1; 
  selectedConsultation: string | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.DoctorInfo$ = this.docService.getDoctor().pipe(
      map((res: any) => res.data) 
    );
    
    this.upcomingAppointments$ = this.docService.getUpcomingAppointments().pipe(
      map((res: any) => res.data) 
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
        next: (res: any) => {
          console.log('🎉 Appointment deleted from system successfully:', res);
          this.upcomingAppointments$ = this.docService.getUpcomingAppointments().pipe(
            map((res: any) => res.data)
          );
        },
        error: (err) => {
          console.error('❌ Error deleting appointment:', err);
        },
      });
    }
  }

  markAsCompleted(id: string): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to mark this active appointment session as completed?')) {
      this.docService.markAppointmentAsCompleted(id).subscribe({
        next: (res: any) => {
          console.log('🎉 Status synced completed successfully on cluster pipeline:', res);
          
          this.upcomingAppointments$ = this.docService.getUpcomingAppointments().pipe(
            map((res: any) => res.data)
          );

          this.docService.triggerPastRefresh();
        },
        error: (err) => {
          console.error('❌ Error updating state status context:', err);
          alert('Status completion transition update issue.');
        }
      });
    }
  }
}