import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Appointment } from '../../models/appointment.model';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-past-consultation',
  imports: [CommonModule],
  templateUrl: './past-consultation.html',
  styleUrls: ['./past-consultation.css']
})
export class PastConsultation implements OnInit {

  doctorService = inject(DoctorService);
  pastConsultations$!: Observable<Appointment[]>;
  selectedConsultation: any | null = null;

  ngOnInit(): void {
    this.pastConsultations$ = this.doctorService.getPastAppointments();
  }
  expandPatientInfo(appointment: any) {
    this.selectedConsultation = appointment;
  }
  closeModal() {
    this.selectedConsultation = null;
  }
}
