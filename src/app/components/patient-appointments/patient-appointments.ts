import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.css'
})
export class PatientAppointments implements OnChanges {
  @Input() appointments: any[] = []; 
  
  appointmentView: 'upcoming' | 'past' = 'upcoming';

  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  nextAppointment: any | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointments']) {
      this.updateAppointmentsView();
    }
  }

  private updateAppointmentsView(): void {
    const rawData = this.appointments || [];
    this.upcomingAppointments = rawData
      .filter(a => a.status && a.status.toLowerCase() === 'scheduled')
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB; 
      });
    this.pastAppointments = rawData
      .filter(a => a.status && a.status.toLowerCase() !== 'scheduled')
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; 
      });
    this.nextAppointment = this.upcomingAppointments.length > 0 ? this.upcomingAppointments[0] : null;

    console.log("=== PROCESSED UPCOMING ===", this.upcomingAppointments);
    console.log("=== PROCESSED PAST ===", this.pastAppointments);
  }
}