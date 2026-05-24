import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';



@Component({
  selector: 'app-login-doctor',
  standalone: true, // Agar standalone module use kar rahe hain
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login-doctor.html',
  styleUrl: './login-doctor.css',
})
export class LoginDoctor {

  loginForm!: FormGroup;
  loginError = '';
  isLoading = false; // 🚀 Naya state helper processing loader ke liye

  constructor(
    private fb: FormBuilder,
    private router: Router, 
    private authService: Auth
  ) {
    this.loginForm = this.fb.group({
      doctorId: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get doctorId() {
    return this.loginForm.controls['doctorId'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }

  getDoctorIdErrors(): string[] {
    const errors: string[] = [];
    if (this.doctorId.errors?.['required']) {
      errors.push('Doctor ID is required');
    }
    return errors;
  }

  getPasswordErrors(): string[] {
    const errors: string[] = [];
    if (this.password.errors?.['required']) {
      errors.push('Password is required');
    }
  
    return errors;
  }

  /**
   * 🚀 FIXED SUBMIT: Ab real HTTP Stream ko subscribe karega
   */
  onSubmit(): void {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Saare validations triggers refresh karo UI par
      return;
    }

    this.isLoading = true;
    const credentials = {
      doctorId: this.loginForm.value.doctorId,
      password: this.loginForm.value.password
    };

    // 🔒 Real HttpOnly Cookie call setup
    this.authService.loginDoctor(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.success) {
          console.log("🎉 Doctor Logged in successfully! Redirecting to dashboard...");
          // Success hote hi doctor dashboard matrix par bhej do
          this.router.navigate(['/doctor']);
        } else {
          this.loginError = response.message || "Invalid Doctor ID or Password";
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("❌ Doctor login request failed:", err);
        // Error response key parsing handle kiya safely
        this.loginError = err.error?.message || "Invalid Credentials or Server Connection Error";
      }
    });
  }
}