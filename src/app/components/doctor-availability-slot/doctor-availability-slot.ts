import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor-availability-slot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-availability-slot.html',
  styleUrl: './doctor-availability-slot.css',
})
export class DoctorAvailabilitySlot implements OnInit {

  allData: any[] = [];
  selectedDate: string | null = null;
  filteredSlots: any[] = [];
  doctorRecord: any;

  date!: Date;
  endDate!: Date;
  dateRange: Date[] = [];

  constructor(private http: HttpClient) {}

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
    const range: Date[] = [];
    for (let i = 0; i <= 4; i++) {
      const d = new Date(this.date);
      d.setDate(this.date.getDate() + i);
      range.push(d);
    }
    this.dateRange = range;
  }

  fetchAvailability() {
    this.http.get<any>(`http://localhost:5000/doctor/availability/`)
      .subscribe(response => {
        this.allData = response.data || response; 
        this.onDateChange();
      });
  }

  onDateChange() {
    if (!this.selectedDate) return;

  
    const targetedDateString = new Date(this.selectedDate).toDateString();

  
    const record = this.allData.find(d =>
      new Date(d.date).toDateString() === targetedDateString
    );

    this.doctorRecord = record;
    this.filteredSlots = record ? record.slots : [];
  }

  updateAvailability() {
    if (!this.doctorRecord) return;
    this.http.put(
      `http://localhost:5000/doctor/availability/`,
      this.doctorRecord
    ).subscribe(res => {
      alert("Availability Updated Successfully!");
      
      this.fetchAvailability(); 
    });
  }
}