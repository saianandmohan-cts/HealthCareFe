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
  filteredDoctors: Doctor[] = [];     
  uniqueDepartments: string[] = [];  
  selectedSpecialisation: string = ''; 
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
        
        const depts = this.doctors
          .map(doc => doc.department)
          .filter((value, index, self) => value && self.indexOf(value) === index);
          
        this.uniqueDepartments = depts.sort();
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error fetching doctors:', err)
    });
    
    this.generateNextFiveDays();
    this.setupActiveSlotPolling(); 
  }

  onSpecialisationChange(): void {
    this.appointment.doctorId = '';
    this.appointment.time = '';
    this.timeSlots = [];
    
    if (this.selectedSpecialisation) {
      this.filteredDoctors = this.doctors.filter(
        doc => doc.department === this.selectedSpecialisation
      );
    } else {
      this.filteredDoctors = [];
    }
    this.cdr.detectChanges();
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
          
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const isToday = this.appointment.date === todayStr;

          if (slotsArray.length > 0) {
            const updatedSlots = slotsArray.map((s: any) => {
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

              return {
                time: s.time,
                disabled: s.isAvailable === false || s.isBooked === true || isPastTime
              };
            });

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

            return {
              time: s.time,
              disabled: s.isAvailable === false || s.isBooked === true || isPastTime
            };
          });
        } else {
          this.timeSlots = []; 
        }
        this.cdr.detectChanges(); 
      }
    });
  }

  clearFormReset(): void {
    this.apptForm.resetForm();
    this.selectedSpecialisation = '';
    this.filteredDoctors = [];
    this.appointment = { doctorId: '', date: '', time: '', mode: '', reason: '' };
    this.timeSlots = [];
    this.cdr.detectChanges();
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
          this.clearFormReset();
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