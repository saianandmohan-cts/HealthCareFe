import { Component, OnInit, OnDestroy, ViewChild, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs'; 
import { startWith, switchMap } from 'rxjs/operators';

import { DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { Auth } from '../../services/auth'; 

import { Doctor } from '../../models/doctor.model';

interface TimeSlot {
  time: string;
  disabled: boolean;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './bookappointment.html',
  styleUrl: './bookappointment.css'
})
export class BookAppointment implements OnInit, OnDestroy {

  @ViewChild('apptForm') apptForm!: NgForm;

  booked = false;
  private pollingSub!: Subscription; 

  appointment = {
    doctorId: '',
    date: '',
    time: '',
    mode: '',
    reason: ''
  };

  doctors: Doctor[] = [];
  availableDates: string[] = [];
  timeSlots: TimeSlot[] = [];

  private doctorService = inject(DoctorService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(Auth); 
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); 
  private router = inject(Router); 

  constructor() {}

  ngOnInit(): void {
    if (!this.authService.authenticated()) {
      this.authService.checkSession().subscribe({
        next: (res) => {
          if (!this.authService.authenticated()) {
            this.router.navigate(['/login-user']);
          }
        }
      });
    }

    this.doctorService.getAllDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res && Array.isArray(res.data) ? res.data : [];
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error fetching doctors:', err)
    });
    
    this.generateNextFiveDays();
    this.setupActiveSlotPolling(); 
  }

  private setupActiveSlotPolling(): void {
    this.pollingSub = interval(4000) 
      .pipe(
        startWith(0),
        switchMap(() => {
          const doctorId = this.appointment.doctorId;
          const date = this.appointment.date;
          if (!doctorId || !date) return [];
          
          const url = `http://localhost:5000/doctor/availability?doctorId=${doctorId}&date=${date}`;
          return this.http.get<any>(url);
        })
      )
      .subscribe({
        next: (res: any) => {
          if (!res) return;
          const slotsArray = res && res.data && res.data.slots ? res.data.slots : (res.slots || []);
          
          if (slotsArray.length > 0) {
            const updatedSlots = slotsArray.map((s: any) => ({
              time: s.time,
              disabled: s.isAvailable === false || s.isBooked === true
            }));

            const currentlySelected = this.appointment.time;
            const matchSlot = updatedSlots.find((x: any) => x.time === currentlySelected);
            if (matchSlot && matchSlot.disabled) {
              this.appointment.time = ''; 
            }

            this.timeSlots = updatedSlots;
          } else {
            this.timeSlots = [];
          }
          this.cdr.detectChanges();
        },
        error: (err) => {}
      });
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
    this.appointment.time = '';
    this.generateTimeSlots();
    this.cdr.detectChanges();
  }

  generateTimeSlots(): void {
    const doctorId = this.appointment.doctorId;
    const date = this.appointment.date;
    if (!doctorId || !date) return;

    const url = `http://localhost:5000/doctor/availability?doctorId=${doctorId}&date=${date}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        const slotsArray = res && res.data && res.data.slots ? res.data.slots : (res.slots || []);
        if (slotsArray.length > 0) {
          this.timeSlots = slotsArray.map((s: any) => ({
            time: s.time,
            disabled: s.isAvailable === false || s.isBooked === true
          }));
        } else {
          this.timeSlots = []; 
        }
        this.cdr.detectChanges(); 
      }
    });
  }

 submitAppointment(): void {
    if (this.apptForm.invalid) {
      this.apptForm.form.markAllAsTouched();
      return;
    }

    const currentPatient = this.authService.currentUser() as any;
    if (!currentPatient) {
      this.router.navigate(['/login-user']);
      return;
    }

    const finalPatientId = currentPatient.id || currentPatient.patientId; 

    const bookingPayload = {
      patient_id: String(finalPatientId), 
      doctorId: String(this.appointment.doctorId),
      date: this.appointment.date,
      time: this.appointment.time,
      mode: this.appointment.mode,
      reason: this.appointment.reason
    };

    this.appointmentService.book(bookingPayload as any).subscribe({
      next: (res: any) => {
        this.booked = true; 
        this.cdr.detectChanges(); 
        
        setTimeout(() => {
          this.booked = false;
          this.apptForm.resetForm();
          this.appointment = { doctorId: '', date: '', time: '', mode: '', reason: '' };
          this.timeSlots = [];
          this.cdr.detectChanges();
          this.router.navigate(['/patient']);
        }, 2000);
      },
      error: (err: any) => {
        console.error('BACKEND REJECTED REQ:', err);
        
        const backendErrorMsg = err.error?.message || "This slot is unavailable.";
        
        this.appointment.time = ''; 
        
        this.generateTimeSlots();
        
        setTimeout(() => {
          const timeControl = this.apptForm.controls['time'];
          if (timeControl) {
            timeControl.setErrors({ 'backendError': backendErrorMsg });
            timeControl.markAsTouched();
          }
          this.cdr.detectChanges();
        }, 300); 
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }
}