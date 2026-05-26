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
  @Input() doctors: any[] = []; 
  appointmentView: 'upcoming' | 'past' = 'upcoming';

  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  nextAppointment: any | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointments'] || changes['doctors']) {
      this.updateAppointmentsView();
    }
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

  private updateAppointmentsView(): void {
    const rawData = this.appointments || [];
    const masterDoctors = this.doctors || [];
    
    const now = new Date();

    const mappedPool = rawData.map(a => {
      let resolvedDoctorName = 'Unknown Doctor';

      if (a.doctorName) {
        resolvedDoctorName = a.doctorName;
      } 
      else if (a.doctorId && typeof a.doctorId === 'object') {
        resolvedDoctorName = a.doctorId.name || 'Doctor';
      } 
      else if (a.doctorId && typeof a.doctorId === 'string') {
        const foundDoc = masterDoctors.find((d: any) => String(d.doctorId) === String(a.doctorId));
        if (foundDoc) {
          resolvedDoctorName = foundDoc.name;
        } else {
          resolvedDoctorName = `Doctor (${a.doctorId})`;
        }
      }

      return {
        ...a,
        doctorName: resolvedDoctorName, 
        _computedTimestamp: this.parseDateTime(a.date, a.time).getTime()
      };
    });

    const activeScheduledPool = mappedPool
      .filter(a => a.status && a.status.toLowerCase() === 'scheduled')
      .sort((a, b) => a._computedTimestamp - b._computedTimestamp);

    const strictUpcoming = activeScheduledPool.filter(a => {
      const apptDate = new Date(a.date);
      const isToday = apptDate.getDate() === now.getDate() &&
                      apptDate.getMonth() === now.getMonth() &&
                      apptDate.getFullYear() === now.getFullYear();

      if (isToday) {
        return true; 
      }
      return a._computedTimestamp >= now.getTime();
    });

    const pastDueScheduled = activeScheduledPool.filter(a => {
      const apptDate = new Date(a.date);
      const isToday = apptDate.getDate() === now.getDate() &&
                      apptDate.getMonth() === now.getMonth() &&
                      apptDate.getFullYear() === now.getFullYear();
                      
      return !isToday && a._computedTimestamp < now.getTime();
    });

    this.nextAppointment = strictUpcoming.length > 0 ? strictUpcoming[0] : null;

    this.upcomingAppointments = strictUpcoming.length > 1 ? strictUpcoming.slice(1) : [];

    const baselinePast = mappedPool
      .filter(a => a.status && a.status.toLowerCase() !== 'scheduled');

    this.pastAppointments = [...pastDueScheduled, ...baselinePast]
      .sort((a, b) => b._computedTimestamp - a._computedTimestamp);
  }
}