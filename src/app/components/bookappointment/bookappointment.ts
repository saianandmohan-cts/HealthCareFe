import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AppointmentService } from '../../services/appointment.service';
import { Auth } from '../../services/auth';
import { DoctorService } from '../../services/doctor.service';
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
          
          const dObj = new Date(date);
          const year = dObj.getFullYear();
          const month = String(dObj.getMonth() + 1).padStart(2, '0');
          const day = String(dObj.getDate()).padStart(2, '0');
          const safeDateString = `${year}-${month}-${day}`;

          const url = `http://localhost:5000/api/availability/slots?doctorId=${doctorId}&date=${safeDateString}`;
          return this.http.get<any>(url, { withCredentials: true });
        })
      )
      .subscribe({
        next: (res: any) => {
          if (!res) return;
          
          const responseData = res.data || res;
          const record = Array.isArray(responseData) ? responseData[0] : responseData;
          const slotsArray = record && record.slots ? record.slots : [];
          
          if (slotsArray.length > 0) {
            this.timeSlots = this.processTimeSlots(slotsArray, this.appointment.date);
            
            const currentlySelected = this.appointment.time;
            const matchSlot = this.timeSlots.find((x: any) => x.time === currentlySelected);
            if (matchSlot && matchSlot.disabled) {
              this.appointment.time = ''; 
            }
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
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      this.availableDates.push(`${year}-${month}-${day}`);
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

    const dObj = new Date(date);
    const year = dObj.getFullYear();
    const month = String(dObj.getMonth() + 1).padStart(2, '0');
    const day = String(dObj.getDate()).padStart(2, '0');
    const safeDateString = `${year}-${month}-${day}`;

    const url = `http://localhost:5000/api/availability/slots?doctorId=${doctorId}&date=${safeDateString}`;
    
    this.http.get<any>(url, { withCredentials: true }).subscribe({
      next: (res) => {
        const responseData = res.data || res;
        const record = Array.isArray(responseData) ? responseData[0] : responseData;
        const slotsArray = record && record.slots ? record.slots : [];
        
        if (slotsArray.length > 0) {
          this.timeSlots = this.processTimeSlots(slotsArray, date);
        } else {
          this.timeSlots = []; 
        }
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Error fetching slots:", err);
        this.timeSlots = [];
        this.cdr.detectChanges();
      }
    });
  }

  private processTimeSlots(slotsArray: any[], selectedDateStr: string): TimeSlot[] {
    const now = new Date();
    
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');
    const localTodayStr = `${currentYear}-${currentMonth}-${currentDay}`; 

    const selectedDateTimestamp = new Date(`${selectedDateStr}T00:00:00`).getTime();
    const todayMidnightTimestamp = new Date(`${localTodayStr}T00:00:00`).getTime();

    const isToday = selectedDateStr === localTodayStr;
    const isPastDay = selectedDateTimestamp < todayMidnightTimestamp;

    return slotsArray.map((s: any) => {
      let isPastTime = false;

      if (isPastDay) {
        isPastTime = true;
      } 
      else if (isToday) {
        const timeMatch = s.time.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3];

          if (ampm) {
            const ampmUpper = ampm.toUpperCase();
            if (ampmUpper === 'PM' && hours < 12) hours += 12;
            if (ampmUpper === 'AM' && hours === 12) hours = 0;
          }

          const slotDateTime = new Date(now);
          slotDateTime.setHours(hours, minutes, 0, 0);

          if (slotDateTime.getTime() <= now.getTime()) {
            isPastTime = true;
          }
        }
      }

      return {
        time: s.time,
        disabled: s.isAvailable === false || s.isBooked === true || isPastTime
      };
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