export interface Patient {
  patientId: number;
  name: string;
  age: number;
  gender: string;
  contactNumber: string;
  email: string;
  password: string;
  address: string;
  medicalHistory: string[];
  allergy: string[];
  doctorAssigned: number[] | string[];
  consultations: number[] | string[]; 
}
