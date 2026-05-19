import { Patient } from '../models/patient.model';

export const PATIENTS: Patient[] = [
  {
    patientId: 1,
    name: 'Sai Anand',
    age: 35,
    gender: 'Male',
    bloodGroup: 'O+',

    email: '123@gmail.com',
    password: '123456',
    
    contact: '9876543210',
    address: 'Bengaluru, India',
    medicalHistory: ['Hypertension', 'Diabetes'],
    allergy: ['lactose'],
    doctorAssigned: [1, 2, 3],
    consulations: [101, 102, 103]
  },
  
  {
    patientId: 2,
    name: 'Priya Sharma',
    age: 29,
    gender: 'Female',
    bloodGroup: 'A+',
    email: 'priya.sharma@example.com',
    password: 'pass123',
    contact: '9876501234',
    address: 'Mumbai, India',
    medicalHistory: ['Asthma'],
    allergy: ['penicillin'],
    doctorAssigned: [2, 4],
    consulations: [104, 105]
  },
  {
    patientId: 3,
    name: 'Ravi Kumar',
    age: 42,
    gender: 'Male',
    bloodGroup: 'B+',
    email: 'ravi.kumar@example.com',
    password: 'secure42',
    contact: '9876512345',
    address: 'Chennai, India',
    medicalHistory: ['Diabetes'],
    allergy: [],
    doctorAssigned: [1, 5],
    consulations: [106, 107, 108]
  },
  {
    patientId: 4,
    name: 'Anjali Mehta',
    age: 36,
    gender: 'Female',
    bloodGroup: 'AB-',
    email: 'anjali.mehta@example.com',
    password: 'anjali36',
    contact: '9876523456',
    address: 'Delhi, India',
    medicalHistory: ['Hypertension'],
    allergy: ['nuts'],
    doctorAssigned: [3],
    consulations: [109]
  },
  {
    patientId: 5,
    name: 'Arun Nair',
    age: 50,
    gender: 'Male',
    bloodGroup: 'O-',
    email: 'arun.nair@example.com',
    password: 'arun50',
    contact: '9876534567',
    address: 'Kochi, India',
    medicalHistory: ['Cardiac issues'],
    allergy: ['seafood'],
    doctorAssigned: [2, 6],
    consulations: [110, 111]
  },
  {
    patientId: 6,
    name: 'Sneha Reddy',
    age: 31,
    gender: 'Female',
    bloodGroup: 'B-',
    email: 'sneha.reddy@example.com',
    password: 'sneha31',
    contact: '9876545678',
    address: 'Hyderabad, India',
    medicalHistory: ['Thyroid disorder'],
    allergy: ['dust'],
    doctorAssigned: [4],
    consulations: [112, 113]
  },
  {
    patientId: 7,
    name: 'Vikram Singh',
    age: 27,
    gender: 'Male',
    bloodGroup: 'A-',
    email: 'vikram.singh@example.com',
    password: 'vikram27',
    contact: '9876556789',
    address: 'Jaipur, India',
    medicalHistory: [],
    allergy: ['pollen'],
    doctorAssigned: [1, 3],
    consulations: [114]
      
    }
];
``