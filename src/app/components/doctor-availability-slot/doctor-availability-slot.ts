import { Component } from '@angular/core';
// import { AVAILABILITY } from '../../mockdata/availability.mock';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const AVAILABILITY: any[] = [];

@Component({
  selector: 'app-doctor-availability-slot',
  imports: [CommonModule,FormsModule],
  templateUrl: './doctor-availability-slot.html',
  styleUrl: './doctor-availability-slot.css',
})

export class DoctorAvailabilitySlot {
  //doctor that is logged in from token 
    id = 2;

  
    allData = AVAILABILITY;
  
  selectedDate: string = ""; // Bound to <input type="date">
  
  filteredSlots: any[] = []; // Slots for the selected day
  doctorRecord: any;


  date!:Date;
  endDate!:Date;
  dateRange: Date[] = [];

  ngOnInit() {
      this.doctorRecord = this.allData.find(d => d.doctorId === this.id);
      this.setDateFunction();

  }
  setDateFunction(){
      this.date = new Date();
      this.endDate = new Date(this.date);
      this.endDate.setDate(this.date.getDate() + 6);
      this.generateRange();
  }

  generateRange(){
    const range: Date[] = [];

    for (let i = 0; i <= 6; i++) {
      const d = new Date(this.date);
      d.setDate(this.date.getDate() + i);
      range.push(d);
    }

    this.dateRange = range;
  }


  // Triggered when date input changes
  onDateChange() {
    if (!this.selectedDate) return;

    this.filteredSlots = this.doctorRecord.slots.filter((s: any) => 
      s.time.startsWith(this.selectedDate)
    );
  }

  updateAvailability() {
    alert("Availability Updated Successfully!");
    console.log("Updated Data:", this.doctorRecord);
    this.onDateChange();
  }

    
}
