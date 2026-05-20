import { Injectable } from '@angular/core';
import { Patient } from '../models/patient.model';

const PATIENTS: any[] = [];

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly PATIENT_KEY = 'logged_in_patient_id';

  constructor() {
     localStorage.setItem('logged_in_patient_id', '1');
  }

  // Simulate patient login
  login(patientId: number): void {
    localStorage.setItem(this.PATIENT_KEY, patientId.toString());
  }

  // Logout patient
  logout(): void {
    localStorage.removeItem(this.PATIENT_KEY);
  }

  // Check if patient is logged in
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.PATIENT_KEY);
  }

  // Get logged-in patient details
  getLoggedInPatient(): Patient | null {
    const patientId = localStorage.getItem(this.PATIENT_KEY);

    if (!patientId) {
      return null;
    }

    // ✅ Parameter 'p' ko explicit 'any' type diya taaki TS error na throw kare
    return (
      PATIENTS.find((p: any) => p.patientId === Number(patientId)) || null
    );
  }

  updateLoggedInPatient(updatedPatient: any): void {
    // ✅ Parameter 'p' ko explicit 'any' type diya
    const patientIndex = PATIENTS.findIndex(
      (p: any) => p.patientId === updatedPatient.patientId
    );

    if (patientIndex !== -1) {
      PATIENTS[patientIndex] = {
        ...PATIENTS[patientIndex],
        ...updatedPatient
      };
    }
  }
}