import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css',})
export class PatientProfile implements OnChanges {
  @Input() patientDetails!: Patient | null;
  @Output() profileSaved = new EventEmitter<Patient>();

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  isEditingPersonal = false;
  showSavedBanner = false;

  editableDetails = {
    email: '',
    contactNumber: '',
    address: '',
    allergyStr: '' 
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patientDetails'] && this.patientDetails) {
      this.resetForm();
    }
  }

  resetForm(): void {
    if (!this.patientDetails) return;
    this.editableDetails = {
      email: this.patientDetails.email ?? '',
      contactNumber: this.patientDetails.contactNumber ?? '', 
      address: this.patientDetails.address ?? '',
      allergyStr: Array.isArray(this.patientDetails.allergy) ? this.patientDetails.allergy.join(', ') : ''
    };
  }

  beginEditPersonal(): void {
    this.resetForm();
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
        const updatedData = res.patient || { ...this.patientDetails, ...profilePayload };
        
        // Parent component ko updated data emit karenge
        this.profileSaved.emit(updatedData);

        this.isEditingPersonal = false;
        this.showSavedBanner = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showSavedBanner = false;
          this.cdr.detectChanges();
        }, 2500);
      },
      error: (err) => console.error('❌ Profile Update Error:', err)
    });
  }
}