import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, switchMap } from 'rxjs'; 
import { map } from 'rxjs/operators';
import { DoctorService } from '../../services/doctor.service';
import { Appointment } from '../../models/appointment.model';
import { AddPrescription } from '../add-prescription/add-prescription'; 

@Component({
  selector: 'app-past-consultation',
  standalone: true,
  imports: [CommonModule, AddPrescription], 
  templateUrl: './past-consultation.html',
  styleUrls: ['./past-consultation.css']
})
export class PastConsultation implements OnInit {
  doctorService = inject(DoctorService);
  pastConsultations$!: Observable<Appointment[]>;
  selectedConsultation: any | null = null;
  activePrescriptionAppointment: any | null = null;

  ngOnInit(): void {

    this.pastConsultations$ = this.doctorService.refreshPastConsultations$.pipe(
      switchMap(() => this.doctorService.getPastAppointments()),
      map((res: any) => res.data)
    );
  }

  expandPatientInfo(appointment: any) {
    this.selectedConsultation = appointment;
  }

  closeModal() {
    this.selectedConsultation = null;
  }

  openPrescriptionModal(appointment: any) {
    this.activePrescriptionAppointment = appointment;
  }

  closePrescriptionModal() {
    this.activePrescriptionAppointment = null;
  }
}