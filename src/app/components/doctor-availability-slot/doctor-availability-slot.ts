import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor-availability-slot',
  standalone: true, // Ensured compatibility with your project setup
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-availability-slot.html',
  styleUrl: './doctor-availability-slot.css',
})
export class DoctorAvailabilitySlot implements OnInit {

  allData: any[] = [];
  selectedDate: string | null = null; // Changed from Date to string because HTML select binds as a string
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
    // If your backend endpoint returns { success: true, data: [...] }
    this.http.get<any>(`http://localhost:5000/doctor/availability/`)
      .subscribe(response => {
        // FIX: Extract the internal array wrapper property from your API layout
        this.allData = response.data || response; 
        this.onDateChange();
      });
  }

  onDateChange() {
    if (!this.selectedDate) return;

    // Convert the template bound selection string value safely to a matching native date format
    const targetedDateString = new Date(this.selectedDate).toDateString();

    // Now allData safely acts as a verified array list
    const record = this.allData.find(d =>
      new Date(d.date).toDateString() === targetedDateString
    );

    this.doctorRecord = record;
    this.filteredSlots = record ? record.slots : [];
  }

  updateAvailability() {
    if (!this.doctorRecord) return;
    console.log(this.doctorRecord);
    this.http.put(
      `http://localhost:5000/doctor/availability/`,
      this.doctorRecord
    ).subscribe(res => {
      alert("Availability Updated Successfully!");
      console.log("Updated Data:", res);
      this.fetchAvailability(); // Re-fetch from DB to get the latest updated array structure
    });
  }
}