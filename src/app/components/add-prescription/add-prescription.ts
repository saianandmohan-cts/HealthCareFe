import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder,FormGroup,FormArray,Validators,ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddPrescription as PrescriptionService} from '../../services/add-prescription';

@Component({
  selector: 'app-add-prescription',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-prescription.html',
  styleUrl: './add-prescription.css',
})
export class AddPrescription implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prescriptionService = inject(PrescriptionService); // Service Inject ki

  prescriptionForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    // Form structure initialization
    this.prescriptionForm = this.fb.group({
      consultationId: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      doctorId: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      appointmentId: ['', Validators.required],
      notes: [''],
      prescriptions: this.fb.array([]) // Array for multiple medicines
    });

    // URL se agar IDs aa rahe hain toh unhe fill karne ke liye
    this.route.queryParams.subscribe(params => {
      if (params['appointmentId']) {
        this.prescriptionForm.patchValue({ appointmentId: params['appointmentId'] });
      }
      if (params['doctorId']) {
        this.prescriptionForm.patchValue({ doctorId: params['doctorId'] });
      }
    });

    // Ek khali medicine row initially dikhane ke liye
    this.addMedicine();
  }

  // Getter: Form ke prescriptions array ko easily target karne ke liye
  get prescriptions(): FormArray {
    return this.prescriptionForm.get('prescriptions') as FormArray;
  }

  // Dynamic field add karne ke liye (Mongoose nested schema support)
  addMedicine(): void {
    const medicineGroup = this.fb.group({
      medicineName: ['', Validators.required],
      dosage: ['', Validators.required],
      route: ['Oral', Validators.required], // Schema strict Enum standard
      frequency: ['', Validators.required]
    });
    this.prescriptions.push(medicineGroup);
  }

  // Row remove karne ke liye
  removeMedicine(index: number): void {
    if (this.prescriptions.length > 1) {
      this.prescriptions.removeAt(index);
    } else {
      alert("Kam se kam ek medicine dalna zaroori hai!");
    }
  }

  // Submit trigger function
  onSubmit(): void {
    if (this.prescriptionForm.invalid) {
      this.errorMessage = "Kripya form ki sabhi details sahi se bharein.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Service ka method call karke data backend par bhej rahe hain
    this.prescriptionService.savePrescription(this.prescriptionForm.value).subscribe({
      next: (res) => {
        this.successMessage = "Prescription successfully save ho gaya hai!";
        this.isSubmitting = false;
        this.prescriptionForm.reset();

        // 2 seconds baad doctor dashboard par wapas redirect
        setTimeout(() => this.router.navigate(['/doctor']), 2000);
      },
      error: (err) => {
        console.error("API Error:", err);
        this.errorMessage = err.error?.message || "Server par data save nahi ho paya.";
        this.isSubmitting = false;
      }
    });
  }

}
