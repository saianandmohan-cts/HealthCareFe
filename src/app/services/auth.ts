import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient , HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { Patient } from '../models/patient.model'; 
import { Doctor } from '../models/doctor.model';

export type UserRole = 'PATIENT' | 'DOCTOR';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly API_BASE_URL = 'http://localhost:5000';

  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<Patient | Doctor | null>(null);
  private roleSignal = signal<UserRole | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly getRole = computed(() => this.roleSignal());
  readonly authenticated = computed(() => this.isAuthenticatedSignal());

  constructor() {
    this.checkSession().subscribe();
  }

  
  checkSession(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/login/me`, { withCredentials: true }).pipe(
      tap((response) => {
        if (response && response.success && response.user) {
          console.log(`🔄 Session restored via HttpOnly Cookie for role [${response.role}]:`, response.user);
          
          this.currentUserSignal.set(response.user);
          this.roleSignal.set(response.role as UserRole);
          this.isAuthenticatedSignal.set(true);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.clearAuthState();
       if (error.status === 401 || error.status === 400) {
          console.log('ℹ️ 1C Hospital Engine: No active session found. User is in Guest Mode.');
        } else {
          console.warn('⚠️ Server Connectivity Issue:', error.message);
        }


        return of({ success: false, message: 'No active session' }); 
      })
    );
  }

  registerPatient(patientData: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/login/register`, patientData);
  }


  loginPatient(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/login`, credentials, { withCredentials: true }).pipe(
      tap((response) => {
        if (response && (response.success === true || response.message === "Login successful")) {
          console.log("🔒 Patient login successful. Syncing profile...");
          this.checkSession().subscribe({
            next: () => {
              response.success = true; 
            }
          });
        }
      })
    );
  }


  loginDoctor(credentials: { doctorId: string; password: string }): Observable<any> {
    console.log("Doctor credentials sent:", credentials);
    return this.http.post<any>(`${this.API_BASE_URL}/login/doctor`, credentials, { withCredentials: true }).pipe(
      tap((response) => {
        if (response && response.success === true) {
          console.log("🔒 Doctor login verified successfully. Securing state...");
          this.checkSession().subscribe();
        }
      })
    );
  }


  private clearAuthState(): void {
    this.currentUserSignal.set(null);
    this.roleSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  logout(): void {
    const currentRole = this.getRole(); 
    
    this.http.post<any>(`${this.API_BASE_URL}/login/logout`, {}, { withCredentials: true }).subscribe({
      next: (res) => {
        console.log("🔒 Backend session cleared:", res.message);
        this.clearAuthState();
        
        if (currentRole === 'DOCTOR') {
          this.router.navigate(['/login-doctor']);
        } else {
          this.router.navigate(['/login-user']);
        }
      },
      error: (err) => {
        console.error("Logout failed", err);
        this.clearAuthState();
        this.router.navigate(['/login-user']);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  getLoggedInPatient(): Patient | null {
    return this.getRole() === 'PATIENT' ? (this.currentUser() as Patient) : null;
  }

  updateLoggedInPatient(updatedPatient: any): void {
    if (this.getRole() === 'PATIENT') {
      this.currentUserSignal.set({
        ...this.currentUser(),
        ...updatedPatient
      } as any);
      console.log("✏️ Local patient profile signal updated:", this.currentUser());
    }
  }
}