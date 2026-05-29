import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  private authService = inject(Auth); 
  private doctorService = inject(DoctorService); 
  private pastService = inject(PastConsultations);
  private route = inject(ActivatedRoute); 

  activeTab = signal<'appointments' | 'history' | 'personal'>('appointments');
  patientDetails = signal<Patient | null>(null);
  appointments = signal<any[]>([]); 
  medicalHistory = signal<string[]>([]);
  doctors = signal<any[]>([]); 

  patientInitials = computed(() => {
    const name = this.patientDetails()?.name
    return name ? name.split(' ').map(n => n[0]).join('') : null;
  });

  upcomingCount = computed(() => 
    this.appointments().filter(a => a.status?.toLowerCase() === 'scheduled').length
  );

  completedCount = computed(() => 
    this.appointments().filter(a => a.status?.toLowerCase() === 'completed').length
  );

  constructor() {
 
  effect(() => {
    const user = this.authService.currentUser() as any;
    const routeId = this.route.snapshot.paramMap.get('patientId');

 
    if (routeId) {
      this.loadDashboardData(routeId);
    } 
  
    else if (user && !this.patientDetails()) {
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
  if (!routeId && !this.authService.currentUser()) {
  
    this.authService.checkSession().subscribe(); 
  }
}

  setActiveTab(tab: 'appointments' | 'history' | 'personal'): void {
    this.activeTab.set(tab); 
  }

  private loadDoctorsPool(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (res: any) => {
        const doctorsData = res && Array.isArray(res.data) ? res.data : (res || []);
        this.doctors.set(doctorsData);
      },
      error: (err) => console.error('Error fetching master registry:', err)
    });
  }

  private loadDashboardData(patientId: string): void {
    this.pastService.listAll().subscribe({
      next: (res) => {
        
        if (res && res.patient) { 
          this.patientDetails.set(res.patient);
          this.medicalHistory.set(res.patient.medicalHistory || []);
          this.appointments.set(res.appointments || []);
        } else if (res && res.patientList) { 
          this.patientDetails.set(res.patientList);
          this.medicalHistory.set(res.patientList.medicalHistory || []);
          this.appointments.set(res.appointments || []);
        }
      },
      error: (err) => console.error('Dashboard Fetch Error:', err)
    });
  }

  handleProfileSave(updatedPatient: Patient): void {
    this.patientDetails.set(updatedPatient);
  }

  onLogout(): void {
    this.authService.logout();
  }
}