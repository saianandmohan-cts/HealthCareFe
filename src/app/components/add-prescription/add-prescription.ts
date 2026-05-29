import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddPrescription as PrescriptionService } from '../../services/add-prescription';
import { DoctorService } from '../../services/doctor.service';

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
  private doctorService = inject(DoctorService); 

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

    this.patchIncomingData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointmentData'] && this.prescriptionForm) {
      this.patchIncomingData();
    }
  }

  get prescriptions(): FormArray {
    return this.prescriptionForm.get('prescriptions') as FormArray;
  }

  private patchIncomingData(): void {
    if (!this.appointmentData || !this.prescriptionForm) return;

    console.log("📥 [FORM ENGINE] MAPPING RECEIVED CONTEXT OBJECT:", this.appointmentData);

    const secureMongoId = this.appointmentData._id || this.appointmentData.appointmentId;

    this.prescriptionForm.patchValue({
      appointmentId: secureMongoId, 
      doctorId: this.appointmentData.doctorId || 'D001',
      notes: this.appointmentData.notes && this.appointmentData.notes !== 'No notes added' ? this.appointmentData.notes : '',
      consultationId: this.appointmentData.consultationId || Math.floor(Date.now() / 1000)
    });

    this.prescriptions.clear();

    if (this.appointmentData.prescriptions && this.appointmentData.prescriptions.length > 0) {
      this.appointmentData.prescriptions.forEach((med: any) => {
        const medicineGroup = this.fb.group({
          medicineName: [med.medicineName || med.name || '', Validators.required],
          dosage: [med.dosage || '', Validators.required],
          route: [med.route || 'Oral', Validators.required], 
          frequency: [med.frequency || '', Validators.required]
        });
        this.prescriptions.push(medicineGroup);
      });
    } else {
      this.addMedicine();
    }
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
      alert("Minimum one medicine id required");
    }
  }

  onSubmit(): void {
    if (this.prescriptionForm.invalid) {
      this.errorMessage = "Please fill up all the details.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.prescriptionService.savePrescription(this.prescriptionForm.value).subscribe({
      next: (res) => {
        this.successMessage = "Prescription successfully saved";
        this.isSubmitting = false;
        
        this.prescriptions.clear();
        this.prescriptionForm.get('notes')?.reset();
        this.addMedicine();

        setTimeout(() => {
          this.prescriptionSaved.emit();

        if (this.doctorService.refreshPastConsultations$) {
            this.doctorService.refreshPastConsultations$.next(true); 
          } else if (this.doctorService.triggerPastRefresh) {
            this.doctorService.triggerPastRefresh();
          }

          console.log("🔄 [1C ENGINE] Past consultations state updated dynamically!");
        }, 1500);
      },
      error: (err) => {
        console.error("API Error during save transaction flow:", err);
        this.errorMessage = err.error?.message || "Error while saving data";
        this.isSubmitting = false;
      }
    });
  }
}