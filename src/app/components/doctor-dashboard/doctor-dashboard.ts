import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PastConsultation } from '../past-consultation/past-consultation';
import { DoctorAvailabilitySlot } from '../doctor-availability-slot/doctor-availability-slot';
import { DoctorService } from '../../services/doctor.service';
import { Appointment } from '../../models/appointment.model';
import { Doctor } from '../../models/doctor.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true, // Standalone feature verification
  imports: [CommonModule, PastConsultation, DoctorAvailabilitySlot],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
})
export class DoctorDashboard implements OnInit {
  docService = inject(DoctorService);

  DoctorInfo$!: Observable<Doctor>;
  upcomingAppointments$!: Observable<Appointment[]>;

  // 🚀 FIXED: Default screen ko '1' kiya taaki doctor ko dashboard khulte hi sabse pehle upcoming appointments dikhein
  flag: number = 1; 
  selectedConsultation: string | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Central data stream loader helper
   * HttpOnly Cookies automatically header mapping bypass karega backend par
   */
  private loadDashboardData(): void {
    this.DoctorInfo$ = this.docService.getDoctor();
    this.upcomingAppointments$ = this.docService.getUpcomingAppointments();
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

  /**
   * 🗑️ Live Cancellation Request Handle
   */
  cancelAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) { // Extra UI layer protection
      this.docService.deleteAppointment(appointmentId).subscribe({
        next: (res: any) => {
          console.log('🎉 Appointment deleted from system successfully:', res);
          // Stream ko re-assign karenge taaki UI automatic dynamic update ho jaye bina page refresh kiye
          this.upcomingAppointments$ = this.docService.getUpcomingAppointments();
        },
        error: (err) => {
          console.error('❌ Error deleting appointment:', err);
        },
      });
    }
  }
}