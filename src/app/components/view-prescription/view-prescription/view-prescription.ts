import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ ChangeDetectorRef import kiya
import { ActivatedRoute, Params } from '@angular/router'; 
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
  private cdr = inject(ChangeDetectorRef); 

  prescriptionDetails: any = null; 
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      const id = params['consultationId']; 
      
      if (id) {
        this.loadData(id); 
      } else {
        this.isLoading = false;
        this.errorMessage = 'Invalid link: No consultation ID provided.';
        this.cdr.detectChanges(); 
      }
    });
  }

  loadData(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.prescriptionDetails = null;
    this.cdr.detectChanges(); 

    this.pastService.getPrescriptionById(id).subscribe({
      next: (res: any) => {
        
        if (res) {
          this.prescriptionDetails = res.data || res; 
        } else {
          this.errorMessage = 'Prescription record format invalid.';
        }
        
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error fetching data from backend:', err);
        this.errorMessage = err.error?.message || 'Error occurred while loading the prescription.';
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  goBack() {
    this.location.back();
  }
}