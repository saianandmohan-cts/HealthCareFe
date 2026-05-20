import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { Patient } from '../model/patient'; 
import { Doctor } from '../model/doctor';

export type UserRole = 'PATIENT' | 'DOCTOR';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly API_BASE_URL = 'http://localhost:5000';

  private http = inject(HttpClient);
  private router = inject(Router);

  // Angular Signals for State Management
  private currentUserSignal = signal<Patient | Doctor | null>(null);
  private roleSignal = signal<UserRole | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  // Read-only values for guards and components
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly getRole = computed(() => this.roleSignal());
  readonly authenticated = computed(() => this.isAuthenticatedSignal());

  constructor() {
    // 🚀 PURE COOKIE: App load/refresh hote hi background check lagaya
    this.checkSession().subscribe();
  }

  /**
   * Who Am I Session Check (Smart Dynamic Handling)
   */
  checkSession(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/login/me`, { withCredentials: true }).pipe(
      tap((response) => {
        if (response && response.success && response.user) {
          console.log(`🔄 Session restored via HttpOnly Cookie for role [${response.role}]:`, response.user);
          
          this.currentUserSignal.set(response.user);
          // 🚀 FIXED: Dynamic role set hoga jo backend se aayega ('DOCTOR' ya 'PATIENT')
          this.roleSignal.set(response.role as UserRole);
          this.isAuthenticatedSignal.set(true);
        }
      }),
      catchError(() => {
        this.clearAuthState();
        return of({ success: false, message: 'No active session' }); 
      })
    );
  }

  /**
   * Patient Login
   */
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

  /**
   * 🩺 LIVE COOKIE-BASED DOCTOR LOGIN
   * Hit marega backend secure endpoint par aur session restore karega
   */
  loginDoctor(credentials: { doctorId: string; password: string }): Observable<any> {
    // 🚀 FIXED: Pura function backend API call ke sath withCredentials: true map kar diya
    return this.http.post<any>(`${this.API_BASE_URL}/login/doctor`, credentials, { withCredentials: true }).pipe(
      tap((response) => {
        if (response && response.success === true) {
          console.log("🔒 Doctor login successful. Syncing profile signals...");
          this.checkSession().subscribe({
            next: () => {
              response.success = true;
            }
          });
        }
      })
    );
  }

  /**
   * State Clear Helper
   */
  private clearAuthState(): void {
    this.currentUserSignal.set(null);
    this.roleSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  /**
   * Logout (Clears everything dynamically)
   */
  logout(): void {
    const currentRole = this.getRole(); // Check dynamic current login state role
    
    this.http.post<any>(`${this.API_BASE_URL}/login/logout`, {}, { withCredentials: true }).subscribe({
      next: (res) => {
        console.log("🔒 Backend session cleared:", res.message);
        this.clearAuthState();
        
        // Dynamic routing base redirect
        if (currentRole === 'DOCTOR') {
          this.router.navigate(['/login-doctor']);
        } else {
          this.router.navigate(['/login-user']);
        }
      },
      error: (err) => {
        console.error("❌ Logout failed, clearing state anyway:", err);
        this.clearAuthState();
        this.router.navigate(['/login-user']);
      }
    });
  }
}