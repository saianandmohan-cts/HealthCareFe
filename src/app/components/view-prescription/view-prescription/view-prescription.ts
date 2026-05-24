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
  private cdr = inject(ChangeDetectorRef); // ✅ Change detection service inject ki

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
        this.cdr.detectChanges(); // Dynamic updates trigger
      }
    });
  }

  loadData(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.prescriptionDetails = null;
    this.cdr.detectChanges(); // Loading state trigger kiya

    this.pastService.getPrescriptionById(id).subscribe({
      next: (res: any) => {
        console.log("📥 FRONTEND RECEIVED PRESCRIPTION PACKET:", res);
        
        if (res) {
          // Wrapper object unpack matrix parsing standard
          this.prescriptionDetails = res.data || res; 
          console.log("🎯 FINALIZED CONTENT FOR BINDING:", this.prescriptionDetails);
        } else {
          this.errorMessage = 'Prescription record format invalid.';
        }
        
        this.isLoading = false;
        // ✅ CRITICAL PUSH: Component UI tree ko force-refresh kiya taaki loading state turant hat jaye
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error fetching data from backend:', err);
        this.errorMessage = err.error?.message || 'An error occurred while loading the prescription.';
        this.isLoading = false;
        this.cdr.detectChanges(); // Error state trigger kiya
      }
    });
  }

  goBack() {
    this.location.back();
  }
}