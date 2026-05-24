import { Component, inject, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddPrescription as PrescriptionService } from '../../services/add-prescription';

@Component({
  selector: 'app-add-prescription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-prescription.html',
  styleUrl: './add-prescription.css',
})
export class AddPrescription implements OnInit, OnChanges {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private prescriptionService = inject(PrescriptionService);

  @Input() appointmentData: any = null;
  @Output() prescriptionSaved = new EventEmitter<void>(); 

  prescriptionForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.prescriptionForm = this.fb.group({
      consultationId: [Math.floor(Date.now() / 1000), [Validators.required, Validators.pattern('^[0-9]*$')]],
      doctorId: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      appointmentId: ['', Validators.required], 
      notes: [''],
      prescriptions: this.fb.array([]) 
    });

    if (this.prescriptions.length === 0) {
      this.addMedicine();
    }

    this.patchIncomingData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointmentData'] && this.prescriptionForm) {
      this.patchIncomingData();
    }
  }

  private patchIncomingData(): void {
    if (this.appointmentData) {
      this.prescriptionForm.patchValue({
        appointmentId: this.appointmentData._id || this.appointmentData.appointmentId, 
        doctorId: this.appointmentData.doctorId,
        consultationId: Math.floor(Date.now() / 1000) 
      });
    }
  }

  get prescriptions(): FormArray {
    return this.prescriptionForm.get('prescriptions') as FormArray;
  }

  addMedicine(): void {
    const medicineGroup = this.fb.group({
      medicineName: ['', Validators.required],
      dosage: ['', Validators.required],
      route: ['Oral', Validators.required], 
      frequency: ['', Validators.required]
    });
    this.prescriptions.push(medicineGroup);
  }

  removeMedicine(index: number): void {
    if (this.prescriptions.length > 1) {
      this.prescriptions.removeAt(index);
    } else {
      alert("Kam se kam ek medicine dalna zaroori hai!");
    }
  }

  onSubmit(): void {
    if (this.prescriptionForm.invalid) {
      this.errorMessage = "Kripya form ki sabhi details sahi se bharein.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.prescriptionService.savePrescription(this.prescriptionForm.value).subscribe({
      next: (res) => {
        this.successMessage = "Prescription successfully save ho gaya hai!";
        this.isSubmitting = false;
        
        // ✅ FIX: Clear and rebuild initial group instead of full broken reset
        this.prescriptions.clear();
        this.prescriptionForm.get('notes')?.reset();
        this.addMedicine();

        setTimeout(() => {
          this.prescriptionSaved.emit();
        }, 1500);
      },
      error: (err) => {
        console.error("API Error:", err);
        this.errorMessage = err.error?.message || "Server par data save nahi ho paya.";
        this.isSubmitting = false;
      }
    });
  }
}