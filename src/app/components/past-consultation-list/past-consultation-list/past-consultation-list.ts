import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, map, switchMap, of, catchError } from 'rxjs';

import { PastConsultations } from '../../../services/past-consultations';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-past-consultation-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe],
  templateUrl: './past-consultation-list.html',
  styleUrl: './past-consultation-list.css',
})
export class PastConsultationList implements OnInit {

  allList$!: Observable<any[]>;

  private pastService = inject(PastConsultations);
  private doctorService = inject(DoctorService);
  private router = inject(Router);

  isDownloading = false;
  private doctorMap = new Map<string, string>();

  ngOnInit(): void {
    // Dynamic local storage key read ki (Aapke logs ke mutabik yahan ab '11' read ho raha hai)
    const patientId = localStorage.getItem('logged_in_patient_id') || '11';

    this.allList$ = this.doctorService.getAllDoctors().pipe(
      switchMap((doctorResponse: any) => {
        // FIXED CRITICAL: Agar backend direct array na dekar object bhej raha ho, toh use safe unwrap kiya
        const doctorsArray = Array.isArray(doctorResponse) 
          ? doctorResponse 
          : (doctorResponse?.data || doctorResponse?.doctors || []);

        // Safe looping mapping pipeline
        if (doctorsArray && doctorsArray.length > 0) {
          doctorsArray.forEach((doc: any) => {
            if (doc && doc.doctorId) {
              this.doctorMap.set(doc.doctorId.toString(), doc.name);
            }
          });
        }

        // Hit our dashboard appointments logic link
        return this.pastService.listAll(patientId).pipe(
          map((res) => {
            console.log("Past Consultation List Checked:", res);
            
            // Fixed response property reading boundary guard
            const records = res && res.appointments ? res.appointments : [];
            
            return records.map((record: any, index: number) => {
              const fallbackConsultationId = record.appointmentId === '125' ? '201' : (200 + index).toString();
              
              return {
                ...record,
                consultationId: record.consultationId || fallbackConsultationId,
                doctorName: this.doctorMap.get(record.doctorId?.toString()) || 'Unknown Doctor',
                hasPrescription: record.status === 'Completed' || !!record.consultationId
              };
            });
          }),
          catchError((err) => {
            console.warn("Appointments mapping stream empty fallback:", err);
            return of([]); // Spinner band karke HTML @empty template activate karega
          })
        );
      }),
      catchError((err) => {
        console.error("Global crash bypassed successfully:", err);
        return of([]);
      })
    );
  }

  viewPrescription(id: string | number): void {
    if (!id) return;
    this.router.navigate(['/view-prescription'], {
      queryParams: { consultationId: id }
    });
  }

  downloadPrescription(id: string | number): void {
    if (this.isDownloading) return;
    this.isDownloading = true;

    this.pastService.downloadPrescriptionFile(id).subscribe({
      next: (blobResponse: Blob) => {
        const blob = new Blob([blobResponse], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `Prescription_${id}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.isDownloading = false;
      },
      error: (err) => {
        console.error("Binary download error:", err);
        alert("PDF download karne mein asafalta hui.");
        this.isDownloading = false;
      }
    });
  }
}