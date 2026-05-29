import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { DashboardService } from '../../services/dashboard.service'; 

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css',
})
export class PatientProfile {
  patientDetails = input<Patient | null>(null);
  profileSaved = output<Patient>(); 

  private dashboardService = inject(DashboardService);

  isEditingPersonal = signal<boolean>(false);
  showSavedBanner = signal<boolean>(false);
  
  private formTracker = signal<number>(0);

  editableDetails = {
    email: '',
    contactNumber: '',
    address: '',
    allergyStr: '' 
  };

  constructor() {
    effect(() => {
      const patient = this.patientDetails();
      if (patient) {
        this.resetForm(patient);
      }
    });
  }

  resetForm(patient: Patient | null = this.patientDetails()): void {
    if (!patient) return;
    this.editableDetails = {
      email: patient.email ?? '',
      contactNumber: patient.contactNumber ?? '', 
      address: patient.address ?? '',
      allergyStr: Array.isArray(patient.allergy) ? patient.allergy.join(', ') : ''
    };
    this.formTracker.set(0); 
  }

  beginEditPersonal(): void {
    this.resetForm();
    this.isEditingPersonal.set(true);
  }

  cancelPersonalEdit(): void {
    this.isEditingPersonal.set(false);
  }

  onInputChange(): void {
    this.formTracker.update(v => v + 1);
  }

  isPersonalDetailsChanged = computed(() => {
    this.formTracker(); 
    const originalPatient = this.patientDetails();
    if (!originalPatient) return false;

    const currentAllergyStr = Array.isArray(originalPatient.allergy) ? originalPatient.allergy.join(', ') : '';

    return (
      this.editableDetails.email !== originalPatient.email ||
      this.editableDetails.contactNumber !== originalPatient.contactNumber ||
      this.editableDetails.address !== originalPatient.address ||
      this.editableDetails.allergyStr !== currentAllergyStr
    );
  });

  savePersonalDetails(): void {
    const currentPatient = this.patientDetails();
    if (!currentPatient) return;

    const allergyArray = this.editableDetails.allergyStr
      ? this.editableDetails.allergyStr.split(',').map(item => item.trim())
      : [];

    const profilePayload = {
      name: currentPatient.name, 
      contactNumber: this.editableDetails.contactNumber,
      email: this.editableDetails.email,
      address: this.editableDetails.address,
      allergy: allergyArray
    };

    const pId = String(currentPatient.patientId);

    this.dashboardService.updatePatientProfile(pId, profilePayload).subscribe({
      next: (res: any) => {
        const updatedData = res.patient || { ...currentPatient, ...profilePayload };
        
        this.profileSaved.emit(updatedData); 

        this.isEditingPersonal.set(false);
        this.showSavedBanner.set(true);

        setTimeout(() => {
          this.showSavedBanner.set(false);
        }, 2500);
      },
      error: (err) => console.error('Profile Update Error:', err)
    });
  }
}