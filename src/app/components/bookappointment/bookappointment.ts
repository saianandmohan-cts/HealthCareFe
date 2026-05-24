import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';

import { DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { Auth } from '../../services/auth'; 

import { Doctor } from '../../models/doctor.model';
import { Appointment } from '../../models/appointment.model';

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
export class BookAppointment implements OnInit {

  @ViewChild('apptForm') apptForm!: NgForm;

  booked = false;

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

    // Response format `{ success: true, status: "success", data: [...] }` ko safely read karega
    this.doctorService.getAllDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res && Array.isArray(res.data) ? res.data : [];
        console.log("Dropdown ke liye Doctors loaded successfully:", this.doctors);
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error fetching doctors:', err)
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
    this.appointment.time = '';
    this.generateTimeSlots();
    this.cdr.detectChanges();
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    const doctorId = this.appointment.doctorId;
    const date = this.appointment.date;
    
    if (!doctorId || !date) {
      this.cdr.detectChanges();
      return;
    }

    const url = `http://localhost:5000/doctor/availability?doctorId=${doctorId}&date=${date}`;
    
    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log("Backend se mile slots response:", res);
        
        // Backend layout matrix array extraction helper
        const slotsArray = res && res.data && res.data.slots ? res.data.slots : (res.slots || []);
        
        if (slotsArray.length > 0) {
          this.timeSlots = slotsArray.map((s: any) => ({
            time: s.time,
            // ✅ FIX: Agar slot available nahi hai YA pehle se booked ho chuka hai, toh dynamic input block (disabled) ho jaye
            disabled: s.isAvailable === false || s.isBooked === true
          }));
        } else {
          this.timeSlots = []; 
        }
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error fetching slots from DB:', err);
        this.timeSlots = [];
        this.cdr.detectChanges();
      }
    });
  }

  submitAppointment(): void {
    console.log("=== SUBMIT TRIGGERED ===");
    
    if (this.apptForm.invalid) {
      this.apptForm.form.markAllAsTouched();
      return;
    }

    const currentPatient = this.authService.currentUser() as any;
    
    if (!currentPatient) {
      console.error("❌ Session Error: No valid patient session found!");
      this.router.navigate(['/login-user']);
      return;
    }

    // Auth pipeline backup fallback validation rules
    const finalPatientId = currentPatient.id || currentPatient.patientId; 

    const bookingPayload = {
      patient_id: String(finalPatientId), 
      doctorId: String(this.appointment.doctorId),
      date: this.appointment.date,
      time: this.appointment.time,
      mode: this.appointment.mode,
      reason: this.appointment.reason
    };

    console.log("🚀 PAYLOAD SECURED WITH PURE COOKIE ID:", bookingPayload);

    this.appointmentService.book(bookingPayload as any).subscribe({
      next: (res: any) => {
        console.log('🎉 SUCCESS: Database insertion complete!', res);
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
        console.error('❌ BACKEND REJECTED REQ:', err);
      }
    });
  }
}