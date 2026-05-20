export interface AvailabilitySlot {
  date: string;
  time: string;
  isAvailable: boolean;
}

export interface DoctorAvailability {
  doctorId: number;
  slot: AvailabilitySlot[];
}
