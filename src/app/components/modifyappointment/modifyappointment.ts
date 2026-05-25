import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 

import { AppointmentService } from '../../services/appointment.service';
import { DoctorService } from '../../services/doctor.service';
import { Auth } from '../../services/auth'; 

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
  private authService = inject(Auth); 

  constructor() {}

  ngOnInit(): void {
    if (!this.authService.authenticated()) {
      this.authService.checkSession().subscribe({
        next: () => {
          if (!this.authService.authenticated()) {
            this.router.navigate(['/login-user']);
            return;
          }
          this.loadComponentData(); 
        }
      });
    } else {
      this.loadComponentData(); 
    }
  }

  private loadComponentData(): void {
    const id = this.route.snapshot.paramMap.get('appointmentId') || '';
    console.log("Fetching Appointment ID for modification:", id);
    
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
        this.doctorService.getDoctorById(this.appointment.doctorId).subscribe({
          next: (data: any) => {
            const doctorData = data?.data || data?.doctor || data;
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
    const url = `http://localhost:5000/doctor/availability?doctorId=${doctorId}&date=${date}`;
    
    this.http.get<any>(url).subscribe({
      next: (res: any) => {
        console.log("Backend response for modification slots:", res);
        
        const slotsArray = res && res.data && res.data.slots ? res.data.slots : (res.slots || []);
        
        if (slotsArray.length > 0) {
          this.timeSlots = slotsArray.map((s: any) => ({
            time: s.time,
            disabled: (s.isAvailable === false || s.isBooked === true) && s.time !== this.appointment.time
          }));
        } else {
          this.timeSlots = [];
        }
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error fetching slots for modification:', err);
        this.timeSlots = [];
        this.cdr.detectChanges();
      }
    });
  }
  updateAppointment(): void {
    if (!this.appointment || !this.appointment.appointmentId) return;

    const updatePayload = {
      date: this.appointment.date,
      time: this.appointment.time,
      mode: this.appointment.mode || 'In-person',
      reason: this.appointment.reason || 'General Consultation',
      status: 'Scheduled'
    };

    console.log("SENDING MODIFICATION PAYLOAD:", updatePayload);

    this.appointmentService.update(this.appointment.appointmentId, updatePayload).subscribe({
      next: (res: any) => {
        this.router.navigate(['/patient']);
      },
      error: (err: any) => console.error('Update operation failed:', err)
    });
  }
  cancelAppointment(): void {
    if (!this.appointment || !this.appointment.appointmentId) return;

    const cancelPayload = { 
      status: 'Cancelled' 
    };

    console.log("SENDING CANCELLATION PAYLOAD:", cancelPayload);

    this.appointmentService.update(this.appointment.appointmentId, cancelPayload).subscribe({
      next: (res: any) => {
        this.router.navigate(['/patient']);
      },
      error: (err: any) => console.error('Cancellation failed:', err)
    });
  }
}