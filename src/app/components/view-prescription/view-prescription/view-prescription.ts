import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router'; // Params import kiya validation ke liye
import { Location, CommonModule } from '@angular/common'; // CommonModule ko safe structuring ke liye rakha
import { PastConsultations } from '../../../services/past-consultations';

@Component({
  selector: 'app-view-prescription',
  standalone: true,
  imports: [CommonModule], // Standalone components mein directives chalane ke liye zaroori hai
  templateUrl: './view-prescription.html',
  styleUrl: './view-prescription.css',
})
export class ViewPrescription implements OnInit {

  private route = inject(ActivatedRoute);
  private pastService = inject(PastConsultations);
  private location = inject(Location); 
  
  prescriptionDetails: any = null; 
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit() {
    // URL query params sunne ke liye (?consultationId=XYZ)
    this.route.queryParams.subscribe((params: Params) => {
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
    this.isLoading = true;
    this.errorMessage = '';

    // Backend API call triggering (Jo automatically aapki login cookie lekar jayega)
    this.pastService.getPrescriptionById(id).subscribe({
      next: (data) => {
        if (data) {
          // Backend controller ka 'responseData' yahan direct map ho jayega
          this.prescriptionDetails = data; 
        } else {
          this.errorMessage = 'Prescription record not found.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching data from backend:', err);
        // Agar token expired hai ya cookie nahi mili, toh backend ka error message dikhega
        this.errorMessage = err.error?.message || 'An error occurred while loading the prescription.';
        this.isLoading = false;
      }
    });
  }

  // Dashboard par wapas jaane ke liye
  goBack() {
    this.location.back();
  }
}