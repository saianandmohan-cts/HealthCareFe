import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(Auth);

  submitError = signal<string>('');
  isSubmitted = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  genders = ['Male', 'Female', 'Other'];

  registerForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.pattern('^[A-Z][a-zA-Z\\s]{2,}$')
    ]],
    age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
    gender: ['', Validators.required],
    contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    address: ['', Validators.required],
    pastProblem: [''],
    allergic: ['', Validators.required],
    allergyDetails: ['']
  });

  get name() { return this.registerForm.get('name'); }
  get age() { return this.registerForm.get('age'); }
  get gender() { return this.registerForm.get('gender'); }
  get contactNumber() { return this.registerForm.get('contactNumber'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get address() { return this.registerForm.get('address'); }
  get allergic() { return this.registerForm.get('allergic'); }
  get allergyDetails() { return this.registerForm.get('allergyDetails'); }

  onSubmit(): void {
    this.submitError.set('');
    this.isSubmitted.set(true);

    if (this.allergic?.value === 'Yes' && !this.allergyDetails?.value?.trim()) {
      this.submitError.set('Please specify your allergy details.');
      return;
    }

    if (this.registerForm.invalid) {
      this.submitError.set('Please fill all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    const formVal = this.registerForm.value;

    const backendPayload = {
      name: formVal.name,
      age: Number(formVal.age),
      gender: formVal.gender,
      contactNumber: formVal.contactNumber, 
      email: formVal.email,
      password: formVal.password,
      address: formVal.address,
      medicalHistory: formVal.pastProblem ? [formVal.pastProblem] : [],
      allergy: formVal.allergic === 'Yes' ? [formVal.allergyDetails] : []
    };

    this.authService.registerPatient(backendPayload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.success) {
          console.log('DB Sync Success', response.message);
          this.router.navigate(['/login-user']);
        } else {
          this.submitError.set(response.message || 'Registration failed.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Registration system failed', err);
        this.submitError.set(err.error?.message || 'Server network error. Please try again later.');
      }
    });
  }
}