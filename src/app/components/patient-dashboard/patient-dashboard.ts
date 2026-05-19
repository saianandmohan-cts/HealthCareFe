import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 

import { Auth } from '../../services/auth'; 
import { DoctorService } from '../../services/doctor.service';
import { PastConsultations } from '../../services/past-consultations'; 

import { Patient } from '../../models/patient.model';
import { Appointment } from '../../models/appointment.model';
import { PastConsultationList } from '../past-consultation-list/past-consultation-list/past-consultation-list';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PastConsultationList],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements OnInit {

  /* ---------------- MAIN TABS & UI STATES ---------------- */
  activeTab: 'appointments' | 'history' | 'personal' = 'appointments';
  appointmentView: 'upcoming' | 'past' = 'upcoming';
  isEditingPersonal = false;
  showSavedBanner = false;

  /* ---------------- DATA STATE ---------------- */
  patientDetails: Patient | null = null;
  appointments: (Appointment & { doctorName: string })[] = [];
  medicalHistory: string[] = [];

  editableDetails = {
    email: '',
    contactNumber: '',
    address: '',
    allergyStr: '' 
  };

  /* ---------------- SERVICES INJECTION ---------------- */
  private authService = inject(Auth); 
  private doctorService = inject(DoctorService);
  private pastService = inject(PastConsultations);
  private http = inject(HttpClient); 
  private route = inject(ActivatedRoute); 
  private cdr = inject(ChangeDetectorRef); // 🚀 FIXED: Change Detector Inject kiya force render ke liye

  constructor() {
    effect(() => {
      const user = this.authService.currentUser() as any;
      if (user && !this.patientDetails) {
        const finalId = user.id || user.patientId;
        if (finalId) {
          this.loadDashboardData(finalId.toString());
        }
      }
    });
  }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('patientId');
    if (routeId) {
      this.loadDashboardData(routeId);
    } else {
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        const finalId = savedUser.id || savedUser.patientId;
        if (finalId && !this.patientDetails) {
          this.loadDashboardData(finalId.toString());
        }
      }
    }
  }

  setActiveTab(tab: 'appointments' | 'history' | 'personal'): void {
    this.activeTab = tab;
    this.cdr.detectChanges(); // View update on tab switch
  }

  /* ---------------- FETCH BACKEND DATA ---------------- */
  private loadDashboardData(patientId: string): void {
    if (!patientId) return;

    this.pastService.listAll(patientId).subscribe({
      next: (res) => {
        console.log("📥 Dashboard Data Fetched Successfully:", res);
        
        if (res && res.patientList) {
          this.patientDetails = res.patientList;
          this.medicalHistory = res.patientList.medicalHistory || [];
          
          const rawAppointments = res.appointments || [];
          
          if (rawAppointments.length > 0) {
            this.processAppointmentsWithDoctors(rawAppointments);
          } else {
            this.appointments = [];
          }

          // 🚀 FIXED: Angular ko forced instruct kiya ki templates render karein
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('❌ Dashboard Fetch Error:', err);
      }
    });
  }

  private processAppointmentsWithDoctors(rawAppointments: any[]): void {
    const mapped = rawAppointments.map(app => ({
      ...app,
      doctorName: 'Hospital Doctor' 
    }));

    this.appointments = mapped;
    this.cdr.detectChanges(); // Sync base array array right away

    mapped.forEach((app, index) => {
      if (app.doctorId) {
        this.doctorService.getDoctorById(app.doctorId).subscribe({
          next: (doc) => {
            if (doc && doc.name) {
              this.appointments[index].doctorName = doc.name;
              this.cdr.detectChanges(); // 🚀 FIXED: Har doctor single element update par rerender hoga
            }
          }
        });
      }
    });
  }

  get patientInitials(): string {
    return this.patientDetails?.name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('') || 'P';
  }

  /* ---------------- APPOINTMENTS FILTERS ---------------- */
  get upcomingAppointments(): (Appointment & { doctorName: string })[] {
    return this.appointments.filter(a => a.status === 'Scheduled'); 
  }

  get pastAppointments(): (Appointment & { doctorName: string })[] {
    return this.appointments.filter(a => a.status !== 'Scheduled');
  }

  get nextAppointment(): (Appointment & { doctorName: string }) | null {
    const scheduled = this.upcomingAppointments;
    if (scheduled.length === 0) return null;
    return scheduled.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }

  get upcomingCount(): number {
    return this.upcomingAppointments.length;
  }

  get completedCount(): number {
    return this.pastAppointments.length;
  }

  get filteredAppointments(): (Appointment & { doctorName: string })[] {
    return this.appointmentView === 'upcoming' ? this.upcomingAppointments : this.pastAppointments;
  }

  /* ---------------- PERSONAL DETAILS ACTIONS ---------------- */
  beginEditPersonal(): void {
    if (!this.patientDetails) return;

    this.editableDetails = {
      email: this.patientDetails.email ?? '',
      contactNumber: this.patientDetails.contactNumber ?? '', 
      address: this.patientDetails.address ?? '',
      allergyStr: Array.isArray(this.patientDetails.allergy) ? this.patientDetails.allergy.join(', ') : ''
    };

    this.isEditingPersonal = true;
    this.cdr.detectChanges();
  }

  cancelPersonalEdit(): void {
    this.isEditingPersonal = false;
    this.cdr.detectChanges();
  }

  get isPersonalDetailsChanged(): boolean {
    if (!this.patientDetails) return false;
    const currentAllergyStr = Array.isArray(this.patientDetails.allergy) ? this.patientDetails.allergy.join(', ') : '';

    return (
      this.editableDetails.email !== this.patientDetails.email ||
      this.editableDetails.contactNumber !== this.patientDetails.contactNumber ||
      this.editableDetails.address !== this.patientDetails.address ||
      this.editableDetails.allergyStr !== currentAllergyStr
    );
  }

  savePersonalDetails(): void {
    if (!this.patientDetails) return;

    const allergyArray = this.editableDetails.allergyStr
      ? this.editableDetails.allergyStr.split(',').map(item => item.trim())
      : [];

    const profilePayload = {
      name: this.patientDetails.name, 
      contactNumber: this.editableDetails.contactNumber,
      email: this.editableDetails.email,
      address: this.editableDetails.address,
      allergy: allergyArray
    };

    const pId = this.patientDetails.patientId;

    this.http.patch<any>(`http://localhost:5000/patient/updatePatient/${pId}`, profilePayload).subscribe({
      next: (res: any) => {
        this.patientDetails = res.patient || { ...this.patientDetails, ...profilePayload };

        this.isEditingPersonal = false;
        this.showSavedBanner = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showSavedBanner = false;
          this.cdr.detectChanges();
        }, 2500);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}