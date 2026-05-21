import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-appointments.html',
  styleUrl: './patient-appointments.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientAppointments {
  @Input() appointments: (Appointment & { doctorName: string })[] = [];
  
  appointmentView: 'upcoming' | 'past' = 'upcoming';

  get upcomingAppointments() {
    return this.appointments.filter(a => a.status === 'Scheduled'); 
  }

  get pastAppointments() {
    return this.appointments.filter(a => a.status !== 'Scheduled');
  }

  get nextAppointment() {
    const scheduled = this.upcomingAppointments;
    if (scheduled.length === 0) return null;
    return scheduled.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }
}