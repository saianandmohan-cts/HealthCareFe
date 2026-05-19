import { PatientConsultation } from '../models/consultation.model';

export const CONSULTATIONS: PatientConsultation[] = [
  {
    patientID: 1,
    consultations: [
      {
        consultationID: 101,
        doctorId: 1,
        date: '2026-04-25',
        notes: 'Cough and mild fever',
        prescriptions: [
          {
            name: 'Expectorant',
            dosage: '1 tablet',
            route: 'Oral',
            frequency: 'Every 4 hours'
          },
          {
            name: 'Paracetamol',
            dosage: '1 tablet',
            route: 'Oral',
            frequency: 'Every 6 hours'
          }
        ],
        appointmentId: 201
      },
      {
        consultationID: 102,
        doctorId: 2,
        date: '2026-04-26',
        notes: 'Follow-up for fever',
        prescriptions: [
          {
            name: 'Vitamin C',
            dosage: '500mg',
            route: 'Oral',
            frequency: 'Once a day'
          }
        ],
        appointmentId: 202
      },
      {
        consultationID: 103,
        doctorId: 3,
        date: '2026-04-27',
        notes: 'Headache complaint',
        prescriptions: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            route: 'Oral',
            frequency: 'Every 8 hours'
          }
        ],
        appointmentId: 203
      }
    ]
  },

  
  {
  patientID: 2,
  consultations: [
    {
      consultationID: 105,
      doctorId: 2,
      date: '2026-04-20',
      notes: "Stomach pain",
      prescriptions: [
        { name: 'Antacid', dosage: '1 tablet', route: 'Oral', frequency: 'Twice a day' }
      ],
      appointmentId: 205
    },
    {
      consultationID: 106,
      doctorId: 3,
      date: '2026-04-21',
      notes: "Nausea",
      prescriptions: [
        { name: 'Ondansetron', dosage: '4mg', route: 'Oral', frequency: 'Every 8 hours' }
      ],
      appointmentId: 206
    },
    {
      consultationID: 107,
      doctorId: 4,
      date: '2026-04-22',
      notes: "Routine check-up",
      prescriptions: [
        { name: 'Multivitamin', dosage: '1 tablet', route: 'Oral', frequency: 'Once a day' }
      ],
      appointmentId: 207
    },
    {
      consultationID: 108,
      doctorId: 1,
      date: '2026-04-23',
      notes: "Back pain",
      prescriptions: [
        { name: 'Muscle relaxant', dosage: '10mg', route: 'Oral', frequency: 'Twice a day' }
      ],
      appointmentId: 208
    }
  ]
  }

];