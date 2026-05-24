// past-consultation.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DoctorService } from '../../services/doctor.service';
import { Appointment } from '../../models/appointment.model';

// 1. Apne naye component ko yahan IMPORT karo ( sahi path laga lena )
import { AddPrescription } from '../add-prescription/add-prescription'; 

@Component({
  selector: 'app-past-consultation',
  standalone: true,
  // 2. IMPORTS array me naye component ko ADD karo
  imports: [CommonModule, AddPrescription], 
  templateUrl: './past-consultation.html',
  styleUrls: ['./past-consultation.css']
})
export class PastConsultation implements OnInit {
  doctorService = inject(DoctorService);
  pastConsultations$!: Observable<Appointment[]>;
  selectedConsultation: any | null = null;
  
  // 3. Ek naya variable jo track karega ki prescription modal khula hai ya nahi
  activePrescriptionAppointment: any | null = null;

  ngOnInit(): void {
    this.pastConsultations$ = this.doctorService.getPastAppointments().pipe(
      map((res: any) => res.data)
    );
  }

  expandPatientInfo(appointment: any) {
    this.selectedConsultation = appointment;
  }

  closeModal() {
    this.selectedConsultation = null;
  }

  // 4. Prescription modal ko open/close karne ke functions
  openPrescriptionModal(appointment: any) {
    this.activePrescriptionAppointment = appointment;
  }

  closePrescriptionModal() {
    this.activePrescriptionAppointment = null;
  }
}