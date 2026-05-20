import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 

import { AppointmentService } from '../../services/appointment.service';
import { DoctorService } from '../../services/doctor.service';
import { Auth } from '../../services/auth'; // 🚀 FIXED: Secure cookie-based Auth service import

import { Appointment } from '../../models/appointment.model';
import { Doctor } from '../../models/doctor.model';

interface TimeSlot {
  time: string;
  disabled: boolean;
}

@Component({
  selector: 'app-modify-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './modifyappointment.html',
  styleUrl: './modifyappointment.css'
})
export class Modifyappointment implements OnInit {

  appointment!: Appointment;
  doctor!: Doctor;

  availableDates: string[] = [];
  timeSlots: TimeSlot[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(Auth); // 🚀 FIXED: Inject secure cookie service

  constructor() {}

  ngOnInit(): void {
    // 🚀 PURE COOKIE CHECK: Agar refresh par signal empty hai, pehle state restore karo
    if (!this.authService.authenticated()) {
      this.authService.checkSession().subscribe({
        next: () => {
          if (!this.authService.authenticated()) {
            // No valid cookie? Bounce back to login instantly
            this.router.navigate(['/login-user']);
            return;
          }
          this.loadComponentData(); // Condition clear, data uthao
        }
      });
    } else {
      this.loadComponentData(); // Pehle se logged in hai, direct load karo
    }
  }

  private loadComponentData(): void {
    const id = this.route.snapshot.paramMap.get('appointmentId') || '';
    console.log("Fetching Appointment ID for modification:", id);
    
    // Wrapper handle for incoming backend response objects
    this.appointmentService.getById(id).subscribe({
      next: (res: any) => {
        console.log("Raw Appointment data received:", res);
        
        const apptData = res.appointment || res.data || res;
        
        if (!apptData) {
          console.error("No valid appointment body found!");
          this.router.navigate(['/patient']);
          return;
        }

        this.appointment = { ...apptData };

        // Doctor data fetch fallback trigger
        this.doctorService.getDoctorById(this.appointment.doctorId).subscribe({
          next: (data: any) => {
            const doctorData = data?.doctor || data?.allDoctor?.[0] || data;
            if (doctorData) {
              this.doctor = doctorData;
              this.generateTimeSlots(); 
            }
          },
          error: (err: any) => console.error('Error fetching doctor detail:', err)
        });
      },
      error: (err: any) => {
        console.error('Error fetching appointment:', err);
        this.router.navigate(['/patient']);
      }
    });

    this.generateNextFiveDays();
  }

  private generateNextFiveDays(): void {
    const today = new Date();
    this.availableDates = [];

    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      this.availableDates.push(d.toISOString().split('T')[0]);
    }
    this.cdr.detectChanges();
  }

  onDateChange(): void {
    if (this.appointment) {
      this.appointment.time = '';
      this.generateTimeSlots();
    }
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    if (!this.appointment || !this.appointment.doctorId || !this.appointment.date) return;

    const doctorId = this.appointment.doctorId;
    const date = this.appointment.date;

    const url = `http://localhost:5000/api/availability/slots?doctorId=${doctorId}&date=${date}`;
    
    this.http.get<{ status: boolean, slots: any[] }>(url).subscribe({
      next: (res: any) => {
        if (res && res.slots) {
          this.timeSlots = res.slots.map((s: any) => ({
            time: s.time,
            disabled: s.isBooked && s.time !== this.appointment.time // User ka current slot select hone par lock na ho
          }));
          this.cdr.detectChanges(); 
        }
      },
      error: (err: any) => {
        console.error('Error fetching slots for modification:', err);
        this.timeSlots = [];
        this.cdr.detectChanges();
      }
    });
  }

  /* ---------- UPDATE / RESCHEDULE ---------- */
  updateAppointment(): void {
    if (!this.appointment || !this.appointment.appointmentId) return;

    const updatePayload = {
      date: this.appointment.date,
      time: this.appointment.time,
      mode: this.appointment.mode || 'In-person',
      reason: this.appointment.reason || 'General Consultation',
      status: 'Scheduled'
    };

    console.log("🚀 SENDING MODIFICATION PAYLOAD:", updatePayload);

    // Baki code same secure method use karega
    this.appointmentService.update(this.appointment.appointmentId, updatePayload).subscribe({
      next: (res: any) => {
        console.log('🎉 SUCCESS: Appointment updated in database:', res);
        this.router.navigate(['/patient']);
      },
      error: (err: any) => console.error('Update operation failed:', err)
    });
  }

  /* ---------- CANCEL ---------- */
  cancelAppointment(): void {
    if (!this.appointment || !this.appointment.appointmentId) return;

    const cancelPayload = { 
      status: 'Cancelled' 
    };

    console.log("🚀 SENDING CANCELLATION PAYLOAD:", cancelPayload);

    this.appointmentService.update(this.appointment.appointmentId, cancelPayload).subscribe({
      next: (res: any) => {
        console.log('🎉 SUCCESS: Appointment cancelled successfully:', res);
        this.router.navigate(['/patient']);
      },
      error: (err: any) => console.error('Cancellation failed:', err)
    });
  }
}