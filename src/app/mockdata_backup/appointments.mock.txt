import { Appointment } from '../models/appointment.model';

export const APPOINTMENTS: Appointment[] = [
  {
    appointmentId: 124,
    doctor: 2,
    patientId: 1,
    date: '2026-04-25',
    time:'10:30 AM' ,
    status: 'Scheduled'
  },
  
  {
    appointmentId: 125,
    doctor: 1,
    patientId: 1,
    date: '2026-04-26',
    time:'11:00 AM',
    status: 'Completed'
  },
  {
    appointmentId: 126,
    doctor: 2,
    patientId: 3,
    date: '2026-04-26',
    time:'11:30 AM',
    status: 'Scheduled'
  },
  {
    appointmentId: 127,
    doctor: 3,
    patientId: 1,
    date: '2026-04-22',
    time:'2:00 PM',
    status: 'Completed'
  },
  {
    appointmentId: 130,
    doctor: 1,
    patientId: 1,
    date: '2026-05-01',
    time:'11:00 AM',
    status: 'Scheduled'
  },{
    appointmentId: 131,
    doctor: 1,
    patientId: 3,
    date: '2026-04-30',
    time:'11:00 AM',
    status: 'Scheduled'
  },{
    appointmentId: 127,
    doctor: 1,
    patientId: 2,
    date: '2026-04-30',
    time:'11:00 AM',
    status: 'Scheduled'
  },
];