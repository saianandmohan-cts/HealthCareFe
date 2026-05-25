import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';



@Component({
  selector: 'app-login-doctor',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login-doctor.html',
  styleUrl: './login-doctor.css',
})
export class LoginDoctor {

  loginForm!: FormGroup;
  loginError = '';
  isLoading = false;

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

  onSubmit(): void {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credentials = {
      doctorId: this.loginForm.value.doctorId,
      password: this.loginForm.value.password
    };
    this.authService.loginDoctor(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.success) {
          this.router.navigate(['/doctor']);
        } else {
          this.loginError = response.message || "Invalid Doctor ID or Password";
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginError = err.error?.message || "Invalid Credentials or Server Connection Error";
      }
    });
  }
}