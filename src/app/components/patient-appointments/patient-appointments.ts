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
    console.log("=== CHILD RECEIVED RAW DATA ===", rawData);

    // 1. ✅ UPCOMING LIST: Filter Scheduled & Ascending Sort (Earliest First)
    this.upcomingAppointments = rawData
      .filter(a => a.status && a.status.toLowerCase() === 'scheduled')
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB; 
      });

    // 2. ✅ PAST LIST: Filter Completed/Cancelled & Descending Sort (Latest History Top Par)
    this.pastAppointments = rawData
      .filter(a => a.status && a.status.toLowerCase() !== 'scheduled')
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; 
      });

    // 3. ✅ NEXT NEAREST DETECTOR: First dynamic row item
    this.nextAppointment = this.upcomingAppointments.length > 0 ? this.upcomingAppointments[0] : null;

    console.log("=== PROCESSED UPCOMING ===", this.upcomingAppointments);
    console.log("=== PROCESSED PAST ===", this.pastAppointments);
  }
}