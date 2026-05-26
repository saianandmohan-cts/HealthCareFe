import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, switchMap } from 'rxjs'; 
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
    this.enforceSingleTabSession();
  }

  private enforceSingleTabSession(): void {
    const isTabActive = sessionStorage.getItem('1c_tab_active');
    
    if (!isTabActive) {
      console.warn('🚨 1C Security: New tab detection triggered via URL copy-paste. Logging out safely...');
      
      sessionStorage.setItem('1c_tab_active', 'true');
      this.executeTabLogoutCleanup();
    }
  }

  private executeTabLogoutCleanup(): void {
    this.http.post<any>(`${this.API_BASE_URL}/login/logout`, {}, { withCredentials: true }).subscribe({
      next: (res) => {
        console.log("🔒 Tab security breach cleared. Session terminated:", res.message);
        this.clearAuthState();

        this.router.navigate(['/']); 
      },
      error: (err) => {
        this.clearAuthState();
        

        this.router.navigate(['/']); 
      }
    });
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
      switchMap((response: any) => {
        if (response && (response.success === true || response.message === "Login successful")) {
          console.log("🔒 Patient identity verified on core backend. Synchronizing signals...");
          return this.checkSession().pipe(
            map(() => {
              response.success = true;
              return response;
            })
          );
        }
        return of(response);
      })
    );
  }

  loginDoctor(credentials: { doctorId: string; password: string }): Observable<any> {
    console.log("Doctor credentials sent:", credentials);
    return this.http.post<any>(`${this.API_BASE_URL}/login/doctor`, credentials, { withCredentials: true }).pipe(
      switchMap((response: any) => {
        if (response && (response.success === true || response.message === "Doctor login successful")) {
          console.log("🔒 Doctor identity verified on core backend. Hydrating signals...");
          return this.checkSession().pipe(
            map(() => {
              response.success = true;
              return response;
            })
          );
        }
        return of(response);
      })
    );
  }

  public clearAuthState(): void {
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
      console.log("Local patient profile signal updated:", this.currentUser());
    }
  }
}