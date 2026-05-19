export interface PatientSummary {
  _id: string;
  patientId:number,          
  name: string;
  medicalHistory: string[];
  allergy: string[];
}

export interface Appointment {
  appointmentId: string;
  doctorId: string;
  patient: PatientSummary;  
  date: string;   
  time: string; 
  status: "Completed" | "Scheduled";
  mode: "In-person" | "Online" | string; 
  reason: string;
}
