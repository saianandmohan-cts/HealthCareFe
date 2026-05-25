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

  private loadDashboardData(patientId: string): void {
    this.pastService.listAll().subscribe({
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
      error: (err) => console.error('Dashboard Fetch Error:', err)
    });
  }

  private processAppointmentsWithDoctors(rawAppointments: any[]): void {
    this.appointments = rawAppointments.map(app => {
      const appObj = { ...app, doctorName: 'Loading Doctor...' };

      if (app.doctorId) {
        this.doctorService.getDoctorById(app.doctorId).subscribe({
          next: (docRes: any) => {
            const docData = docRes?.data || docRes?.doctor || docRes;
            if (docData && docData.name) {
              appObj.doctorName = docData.name;
            } else {
              appObj.doctorName = 'Hospital Doctor';
            }
            this.cdr.detectChanges();
          },
          error: () => {
            appObj.doctorName = 'Hospital Doctor';
            this.cdr.detectChanges();
          }
        });
      } else {
        appObj.doctorName = 'General Physician';
      }
      return appObj;
    });
    this.cdr.detectChanges();
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