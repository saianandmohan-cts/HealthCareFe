import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, effect, ChangeDetectorRef } from '@angular/core'; 
import { RouterModule, ActivatedRoute } from '@angular/router';

import { Auth } from '../../services/auth'; 
import { DoctorService } from '../../services/doctor.service';
import { PastConsultations } from '../../services/past-consultations'; 

import { Patient } from '../../models/patient.model';
import { PastConsultationList } from '../past-consultation-list/past-consultation-list/past-consultation-list';
import { PatientAppointments } from '../patient-appointments/patient-appointments';
import { PatientProfile } from '../patient-profile/patient-profile';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PastConsultationList, PatientAppointments, PatientProfile],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements OnInit {

  activeTab: 'appointments' | 'history' | 'personal' = 'appointments';
  patientDetails: Patient | null = null;
  appointments: any[] = []; 
  medicalHistory: string[] = [];
  doctors: any[] = []; 

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
    this.loadDoctorsPool();

    const routeId = this.route.snapshot.paramMap.get('patientId');
    if (routeId) {
      this.loadDashboardData(routeId);
    } else {
      this.authService.checkSession().subscribe({
        next: () => {
          const user = this.authService.currentUser() as any;
          const finalId = user?.id || user?.patientId;
          if (finalId && !this.patientDetails) {
            this.loadDashboardData(finalId.toString());
          }
        }
      });
    }
  }

  setActiveTab(tab: 'appointments' | 'history' | 'personal'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }


  private loadDoctorsPool(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (res: any) => {
        this.doctors = res && Array.isArray(res.data) ? res.data : (res || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching master registry:', err)
    });
  }

  private loadDashboardData(patientId: string): void {
    this.pastService.listAll().subscribe({
      next: (res) => {
        console.log("📥 Dashboard Data Fetched Successfully:", res);
        
        if (res && res.patientList) {
          this.patientDetails = res.patientList;
          this.medicalHistory = res.patientList.medicalHistory || [];
          
          const rawAppointments = res.appointments || [];
          if (rawAppointments.length > 0) {
            this.appointments = [...rawAppointments];
            this.cdr.detectChanges();
          } else {
            this.appointments = [];
            this.cdr.detectChanges();
          }
        }
      },
      error: (err) => console.error('Dashboard Fetch Error:', err)
    });
  }

  get patientInitials(): string {
    return this.patientDetails?.name?.split(' ')?.map(n => n[0])?.join('') || 'P';
  }

  get upcomingCount(): number {
    return this.appointments.filter(a => a.status && a.status.toLowerCase() === 'scheduled').length;
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status && a.status.toLowerCase() === 'completed').length;
  }

  handleProfileSave(updatedPatient: Patient): void {
    this.patientDetails = updatedPatient;
    this.cdr.detectChanges();
  }

  onLogout(): void {
    this.authService.logout();
  }
}