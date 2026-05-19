export interface Prescription {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
}

export interface Consultation {
  consultationID: number;
  doctorId: number;
  date: string;
  notes: string;
  prescriptions: Prescription[];
  appointmentId: number;
}

export interface PatientConsultation {
  patientID: number;
  consultations: Consultation[];
}