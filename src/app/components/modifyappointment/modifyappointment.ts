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
  isDialogOpen: boolean = false;

  originalDate: string = '';
  originalTime: string = '';

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
    
    this.appointmentService.getById(id).subscribe({
      next: (res: any) => {
        const apptData = res.appointment || res.data || res;
        
        if (!apptData) {
          this.router.navigate(['/patient']);
          return;
        }

        this.appointment = { ...apptData };

        if (this.appointment.date) {
          this.appointment.date = new Date(this.appointment.date).toISOString().split('T')[0];
        }

        this.originalDate = this.appointment.date;
        this.originalTime = this.appointment.time;

        this.doctorService.getDoctorById(this.appointment.doctorId).subscribe({
          next: (data: any) => {
            const doctorData = data?.data || data?.doctor || data;
            if (doctorData) {
              this.doctor = doctorData;
              this.generateTimeSlots(); 
            }
          },
          error: (err: any) => console.error(err)
        });
      },
      error: (err: any) => {
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
        const slotsArray = res && res.data && res.data.slots ? res.data.slots : (res.slots || []);
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const isToday = date === todayStr;

        if (slotsArray.length > 0) {
          this.timeSlots = slotsArray.map((s: any) => {
            let isPastTime = false;

            if (isToday) {
              const timeMatch = s.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
              if (timeMatch) {
                let hours = parseInt(timeMatch[1], 10);
                const minutes = parseInt(timeMatch[2], 10);
                const ampm = timeMatch[3].toUpperCase();

                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;

                const slotDateTime = new Date(now);
                slotDateTime.setHours(hours, minutes, 0, 0);

                if (slotDateTime.getTime() < now.getTime()) {
                  isPastTime = true;
                }
              }
            }

            const backendDisabled = s.isAvailable === false || s.isBooked === true;

            return {
              time: s.time,
              disabled: (backendDisabled || isPastTime) && s.time !== this.originalTime
            };
          });
        } else {
          this.timeSlots = [];
        }
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
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

    this.appointmentService.update(this.appointment.appointmentId, updatePayload).subscribe({
      next: (res: any) => {
        this.router.navigate(['/patient']);
      },
      error: (err: any) => console.error(err)
    });
  }

  openConfirmationDialog(): void {
    this.isDialogOpen = true;
    this.cdr.detectChanges();
  }

  closeConfirmationDialog(): void {
    this.isDialogOpen = false;
    this.cdr.detectChanges();
  }

  confirmAndExecuteCancel(): void {
    if (!this.appointment || !this.appointment.appointmentId) return;
    
    this.isDialogOpen = false; 
    const cancelPayload = { status: 'Cancelled' };

    this.appointmentService.update(this.appointment.appointmentId, cancelPayload).subscribe({
      next: (res: any) => {
        this.router.navigate(['/patient']);
      },
      error: (err: any) => console.error(err)
    });
  }
}