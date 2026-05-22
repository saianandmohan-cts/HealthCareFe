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
    // Pipeline initialization driven by HTTPOnly cookies natively
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

        // Dynamic native call without parsing parameters
        return this.pastService.listAll().pipe(
          map((res) => {
            console.log("📥 Dynamic Payload tracking successfully trace verified:", res);
            const records = res && res.appointments ? res.appointments : [];
            
            return records.map((record: any, index: number) => {
              // Custom map configuration matching database properties
              const fallbackConsultationId = (5001 + index).toString();
              
              return {
                ...record,
                consultationId: record.consultationId || fallbackConsultationId,
                doctorName: this.doctorMap.get(record.doctorId?.toString()) || 'Unknown Doctor',
                hasPrescription: record.status === 'Completed' || !!record.consultationId
              };
            });
          }),
          catchError((err) => {
            console.warn("No dynamic appointment history pipeline returned:", err);
            return of([]); // Toggle loader state immediately to render @empty
          })
        );
      }),
      catchError((err) => {
        console.error("Asynchronous initialization stream halted:", err);
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
        console.error("Binary download logic catch block failure:", err);
        alert("PDF download karne mein asafalta hui.");
        this.isDownloading = false;
      }
    });
  }
}