import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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

  loginError = signal<string>('');
  isSubmitted = signal<boolean>(false);
  isLoading = signal<boolean>(false); 

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  constructor() {
    this.loginForm.valueChanges.subscribe(() => {
      if (this.loginError()) {
        this.loginError.set(''); 
      }
    });
  }

  onSubmit(): void {
    this.loginError.set('');
  
    if (this.loginForm.invalid) return;
    this.isSubmitted.set(true);
    this.isLoading.set(true); 
    
    const credentials = this.loginForm.value;

    this.authService.loginPatient(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isSubmitted.set(false);
        
        if (response && (response.success === true || response.message === 'Login successful')) {
          sessionStorage.setItem('1c_tab_active', 'true');
          this.router.navigate(['/patient']);
        } else {
          this.loginError.set(response.message || 'Invalid response from server.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isSubmitted.set(false);
        this.loginError.set(err.error?.message || err.message || 'Incorrect Gmail or Password. Please try again.');
      }
    });
  }
}