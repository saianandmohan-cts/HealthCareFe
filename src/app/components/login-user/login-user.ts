import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormsModule, CommonModule],
  templateUrl: './login-user.html',
  styleUrl: './login-user.css',
})
export class LoginUser {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(Auth);

  loginForm: FormGroup;
  isSubmitted = false;
  loginError = '';
  isLoading = false; 

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get email() {
    return this.loginForm.controls['email'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }

  getEmailErrors(): string[] {
    const error: string[] = [];
    if (this.email.errors?.['required']) {
      error.push('Email is required');
    }
    if (this.email.errors?.['email']) {
      error.push('Invalid email format');
    }
    return error;
  }

  getPasswordErrors(): string[] {
    const error: string[] = [];
    if (this.password.errors?.['required']) {
      error.push('Password is required');
    }

    return error;
  }

  onSubmit(): void {
    this.loginError = '';
    
    if (this.loginForm.invalid) return;

    this.isSubmitted = true;
    this.isLoading = true; 

    const credentials = this.loginForm.value;

  this.authService.loginPatient(credentials).subscribe({
  next: (response) => {
    this.isLoading = false;
    
    if (response && (response.success === true || response.message === 'Login successful')) {
      this.router.navigate(['/patient']);

    } else {
      this.loginError = 'Invalid response from server.';
    }
  },
  error: (err) => {
    this.isLoading = false;
    this.loginError = err.error?.message || 'Something went wrong. Please try again.';
  }
});
  }
}