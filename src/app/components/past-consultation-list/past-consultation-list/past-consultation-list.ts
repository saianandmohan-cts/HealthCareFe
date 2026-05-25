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
    this.allList$ = this.doctorService.getAllDoctors().pipe(
      switchMap((doctorResponse: any) => {
        const doctorsArray = Array.isArray(doctorResponse) 
          ? doctorResponse 
          : (doctorResponse?.data || doctorResponse?.doctors || []);

        if (doctorsArray && doctorsArray.length > 0) {
          doctorsArray.forEach((doc: any) => {
            if (doc && doc.doctorId) {
              this.doctorMap.set(doc.doctorId.toString(), doc.name);
            }
          });
        }

        return this.pastService.listAll().pipe(
          map((res) => {
            console.log("📥 Consultation Pipeline Target Trace:", res);
            const rawAppointments = res && res.appointments ? res.appointments : [];
            const pastRecords = rawAppointments.filter((app: any) => app.status === 'Completed');
            
            return pastRecords.map((record: any) => {
              return {
                ...record,
                targetId: record._id, 
                doctorName: this.doctorMap.get(record.doctorId?.toString()) || 'Hospital Doctor',
                hasPrescription: true 
              };
            });
          }),
          catchError((err) => {
            console.warn("No dynamic appointment history pipeline returned:", err);
            return of([]); 
          })
        );
      }),
      catchError((err) => {
        console.error("Asynchronous initialization stream halted:", err);
        return of([]);
      })
    );
  }

  viewPrescription(id: string): void {
    if (!id) return;
    this.router.navigate(['/view-prescription'], {
      queryParams: { consultationId: id }
    });
  }
downloadPrescription(record: any): void {
    if (this.isDownloading || !record) return;
    this.isDownloading = true;
    const trackingId = record.targetId;
    const displayId = record.consultationId || record.appointmentId || 'Doc';

    this.pastService.downloadPrescriptionFile(trackingId).subscribe({
      next: (blobResponse: Blob) => {
        const blob = new Blob([blobResponse], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `Prescription_${displayId}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.isDownloading = false;
      },
      error: (err) => {
        console.error("Binary download logic catch block failure:", err);
        alert("PDF download karne mein asafalta hui.");
        this.isDownloading = false;
      }
    });
  }
}