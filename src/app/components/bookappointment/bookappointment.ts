import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; // 🚀 Router import kiya redirect ke liye
import { HttpClient } from '@angular/common/http';

import { DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { Auth } from '../../services/auth'; // 🚀 FIXED: Sahi secure Auth service import ki

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
  private authService = inject(Auth); // 🚀 FIXED: Apni secure cookie-based service connect ki
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); 
  private router = inject(Router); // Router inject kiya

  constructor() {}

  ngOnInit(): void {
    // 🚀 PURE COOKIE FIX: Agar page refresh hua aur state khali hai, toh pehle session load karo
    if (!this.authService.authenticated()) {
      this.authService.checkSession().subscribe({
        next: (res) => {
          if (!this.authService.authenticated()) {
            // Agar session check ke baad bhi login nahi mila, toh login page par bhagao
            this.router.navigate(['/login-user']);
          }
        }
      });
    }

    // Fetch doctors on load
    this.doctorService.getAllDoctors().subscribe({
      next: (data: any) => {
        this.doctors = Array.isArray(data) ? data : (data.allDoctor || []);
        console.log("Dropdown ke liye Doctors loaded:", this.doctors);
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

    const url = `http://localhost:5000/api/availability/slots?doctorId=${doctorId}&date=${date}`;
    
    this.http.get<{ status: boolean, slots: any[] }>(url).subscribe({
      next: (res) => {
        console.log("Backend se mile slots response:", res);
        
        if (res && res.slots && res.slots.length > 0) {
          this.timeSlots = res.slots.map(s => ({
            time: s.time,
            disabled: s.isBooked
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

    // 🚀 FIXED: Ab data direct secure signals state se uthega
    const currentPatient = this.authService.currentUser() as any;
    
    if (!currentPatient || !currentPatient.patientId) {
      console.error("❌ Session Error: No valid patient session found!");
      this.router.navigate(['/login-user']);
      return;
    }

    // Custom patient ID jo dashboard fetch karne ke liye database ko chahiye
    const finalPatientId = currentPatient.patientId; 

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
          
          // 🚀 SUCCESS REDIRECT: Appointment book hote hi user ko safely patient dashboard par wapas bhej do
          this.router.navigate(['/patient']);
        }, 2000);
      },
      error: (err: any) => {
        console.error('❌ BACKEND REJECTED REQ:', err);
      }
    });
  }
}