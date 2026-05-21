import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {

  registerForm!: FormGroup;
  submitError = '';
  isSubmitted = false;
  isLoading = false;

  genders = ['Male', 'Female', 'Other'];

  private authService = inject(Auth);

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['',
          [
            Validators.required,
            Validators.pattern('^[A-Z][a-zA-Z\\s]{2,}$')
          ]
      ],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', Validators.required],
      // 🚀 FIXED: Blood group hatakar contactNumber add kiya (Strict 10 digit validation ke sath)
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', Validators.required],
      pastProblem: [''],
      allergic: ['', Validators.required],
      allergyDetails: ['']
    });
  }

  // Getters for cleaner validation access in HTML
  get name() { return this.registerForm.controls['name']; }
  get age() { return this.registerForm.controls['age']; }
  get gender() { return this.registerForm.controls['gender']; }
  get contactNumber() { return this.registerForm.controls['contactNumber']; } // 🚀 New Getter
  get email() { return this.registerForm.controls['email']; }
  get password() { return this.registerForm.controls['password']; }
  get address() { return this.registerForm.controls['address']; }
  get allergic() { return this.registerForm.controls['allergic']; }
  get allergyDetails() { return this.registerForm.controls['allergyDetails']; }

  onSubmit(): void {
    this.submitError = '';
    this.isSubmitted = true;

    if (this.allergic.value === 'Yes' && !this.allergyDetails.value?.trim()) {
      this.submitError = 'Please specify your allergy details.';
      return;
    }

    if (this.registerForm.invalid) {
      this.submitError = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    const formVal = this.registerForm.value;

    // 🚀 FIXED: Ab actual user ka numeric phone number body data payload me jayega
    const backendPayload = {
      name: formVal.name,
      age: Number(formVal.age),
      gender: formVal.gender,
      contactNumber: formVal.contactNumber, // Direct dynamic connection
      email: formVal.email,
      password: formVal.password,
      address: formVal.address,
      medicalHistory: formVal.pastProblem ? [formVal.pastProblem] : [],
      allergy: formVal.allergic === 'Yes' ? [formVal.allergyDetails] : []
    };

    this.authService.registerPatient(backendPayload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.success) {
          console.log('🎉 DB Sync Success:', response.message);
          this.router.navigate(['/login-user']);
        } else {
          this.submitError = response.message || 'Registration failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Registration system failed:', err);
        this.submitError = err.error?.message || 'Server network error. Please try again later.';
      }
    });
  }
}