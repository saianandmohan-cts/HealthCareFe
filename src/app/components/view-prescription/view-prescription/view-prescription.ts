import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router'; // ✅ Params import kiya queryParams ke liye
import { Location, CommonModule } from '@angular/common'; 
import { PastConsultations } from '../../../services/past-consultations';

@Component({
  selector: 'app-view-prescription',
  standalone: true,
  imports: [CommonModule], 
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
  // URL query params ko listen karne ke liye (?consultationId=200)
  this.route.queryParams.subscribe((params: Params) => {
    
    // ✅ FIXED: 'id' ki jagah 'consultationId' likha, kyunki URL mein wahi naam hai!
    const id = params['consultationId']; 
    
    if (id) {
      this.loadData(id); // Ab yahan se sahi ID loadData ko pass hogi
    } else {
      this.isLoading = false;
      this.errorMessage = 'Invalid link: No consultation ID provided.';
    }
  });
}

  loadData(id: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.pastService.getPrescriptionById(id).subscribe({
      next: (data) => {
        if (data) {
          this.prescriptionDetails = data; 
        } else {
          this.errorMessage = 'Prescription record not found.';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching data from backend:', err);
        this.errorMessage = err.error?.message || 'An error occurred while loading the prescription.';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }
}