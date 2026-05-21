import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core'; 
import { RouterModule, ActivatedRoute } from '@angular/router';

import { Auth } from '../../services/auth'; 
import { DoctorService } from '../../services/doctor.service';
import { PastConsultations } from '../../services/past-consultations'; 

import { Patient } from '../../models/patient.model';
import { Appointment } from '../../models/appointment.model';

import { PastConsultationList } from '../past-consultation-list/past-consultation-list/past-consultation-list';
import { PatientAppointments } from '../patient-appointments/patient-appointments';
import { PatientProfile } from '../patient-profile/patient-profile';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  // 🚀 Dono naye standalone components ko yahan add kar diya
  imports: [CommonModule, RouterModule, PastConsultationList, PatientAppointments, PatientProfile],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements OnInit {

  /* ---------------- MAIN TABS ---------------- */
  activeTab: 'appointments' | 'history' | 'personal' = 'appointments';

  /* ---------------- DATA STATE ---------------- */
  patientDetails: Patient | null = null;
  appointments: (Appointment & { doctorName: string })[] = [];
  medicalHistory: string[] = [];

  /* ---------------- SERVICES INJECTION ---------------- */
  private authService = inject(Auth); 
  private doctorService = inject(DoctorService);
  private pastService = inject(PastConsultations);
  private route = inject(ActivatedRoute); 
  private cdr = inject(ChangeDetectorRef);

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
    this.cdr.detectChanges();
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
            this.cdr.detectChanges();
          }
        }
      },
      error: (err) => console.error('❌ Dashboard Fetch Error:', err)
    });
  }

  private processAppointmentsWithDoctors(rawAppointments: any[]): void {
    const mapped = rawAppointments.map(app => ({
      ...app,
      doctorName: 'Hospital Doctor' 
    }));

    this.appointments = mapped;
    this.cdr.detectChanges();

    mapped.forEach((app, index) => {
      if (app.doctorId) {
        this.doctorService.getDoctorById(app.doctorId).subscribe({
          next: (doc) => {
            if (doc && doc.name) {
              this.appointments[index].doctorName = doc.name;
              // Reference update taaki child component updates pakad sake
              this.appointments = [...this.appointments];
              this.cdr.detectChanges();
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

  get upcomingCount(): number {
    return this.appointments.filter(a => a.status === 'Scheduled').length;
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status !== 'Scheduled').length;
  }

  // Child Profile save event handler
  handleProfileSave(updatedPatient: Patient): void {
    this.patientDetails = updatedPatient;
    this.cdr.detectChanges();
  }

  onLogout(): void {
    this.authService.logout();
  }
}