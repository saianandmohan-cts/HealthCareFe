import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-availability-slot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-availability-slot.html',
  styleUrl: './doctor-availability-slot.css',
})
export class DoctorAvailabilitySlot implements OnInit {
  @Input() doctorId: string = '';

  allData: any[] = [];
  selectedDate: string = ''; 
  filteredSlots: any[] = [];
  doctorRecord: any;

  date!: Date;
  endDate!: Date;
  dateRange: string[] = []; 

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit() {
    this.setDateFunction();
    this.fetchAvailability();
  }

  setDateFunction() {
    this.date = new Date();
    this.endDate = new Date(this.date);
    this.endDate.setDate(this.date.getDate() + 4); 
    this.generateRange();
  }

  generateRange() {
    const range: string[] = [];
    for (let i = 0; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      range.push(`${year}-${month}-${day}`);
    }
    this.dateRange = range;
    if(this.dateRange.length > 0) {
      this.selectedDate = this.dateRange[0];
    }
  }

  fetchAvailability() {
    const activeDocId = this.doctorId; 
    
    this.http.get<any>(`http://localhost:5000/api/availability/slots?doctorId=${activeDocId}`)
      .subscribe({
        next: (response) => {
          console.log("📥 Loaded Availability logs successfully:", response);
          this.allData = response.data || response;
          if(!Array.isArray(this.allData)) {
            this.allData = [this.allData];
          }
          this.onDateChange();
        },
        error: (err) => console.error("🚨 Fetch slots error:", err)
      });
  }

  onDateChange() {
    if (!this.selectedDate) {
      this.filteredSlots = [];
      return;
    }

    console.log("🔍 Filtering slots locally for target selected date:", this.selectedDate);

    const record = this.allData.find(d => {
      if (!d.date) return false;
      const dbDateStr = d.date.split('T')[0]; 
      return dbDateStr === this.selectedDate;
    });

    this.doctorRecord = record;
    
    if (record && record.slots) {
      this.filteredSlots = record.slots;
    } else {
      this.generateDefaultTestingSlots();
    }
    this.cdr.detectChanges();
  }

  generateDefaultTestingSlots() {
    const defaultHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    this.filteredSlots = defaultHours.map(time => ({
      time,
      isAvailable: true,
      isBooked: false
    }));
    
    this.doctorRecord = {
      doctorId: this.doctorId || 'D001',
      date: this.selectedDate,
      slots: this.filteredSlots
    };
  }

  toggleLocalSlot(slot: any, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    slot.isAvailable = checkbox.checked;
    this.cdr.detectChanges();
  }

  updateAvailability() {
    const activeDocId = this.doctorId || 'D001';
    
    const payload = {
      doctorId: String(activeDocId),
      date: this.selectedDate,
      slots: this.filteredSlots
    };

    console.log("📤 Sending updated availability configuration parameters stream:", payload);

    this.http.post('http://localhost:5000/api/availability/set', payload, { withCredentials: true })
      .subscribe({
        next: (res) => {
          alert("Availability updated & conflict appointments clean cancelled successfully! 🎉");
          this.fetchAvailability(); 
        },
        error: (err) => {
          console.error("🚨 Controller transaction exception:", err);
          alert("Failed transaction database level check. Error trace: " + err.message);
        }
      });
  }
}