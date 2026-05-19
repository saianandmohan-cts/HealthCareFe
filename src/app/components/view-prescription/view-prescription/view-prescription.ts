import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'; // <-- Import Location service
import { PastConsultations } from '../../../services/past-consultations';
; // Ensure path is correct

@Component({
  selector: 'app-view-prescription',
  standalone: true,
  templateUrl: './view-prescription.html',
  styleUrl: './view-prescription.css',
})
export class ViewPrescription implements OnInit {

  private route = inject(ActivatedRoute);
  private pastService = inject(PastConsultations);
  private location = inject(Location); // <-- Inject Location service
  
  prescriptionDetails: any = null; 
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['consultationId']; 
      
      if (id) {
        this.loadData(id);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Invalid link: No consultation ID provided.';
      }
    });
  }

  loadData(id: string) {
    this.pastService.getPrescriptionById(id).subscribe({
      next: (data) => {
        if (data) {
          this.prescriptionDetails = data; 
        } else {
          this.errorMessage = 'Prescription record not found.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.errorMessage = 'An error occurred while loading the prescription.';
        this.isLoading = false;
      }
    });
  }

  // NEW: Angular way to go back to the previous page
  goBack() {
    this.location.back();
  }
}