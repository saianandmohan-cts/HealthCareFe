import { Doctor } from '../models/doctor.model';

export const DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Sahil Fulmali',
    experience: 20,
    department: 'E&T',
    url: 'https://hips.hearstapps.com/hmg-prod/images/portrait-of-a-happy-young-doctor-in-his-clinic-royalty-free-image-1661432441.jpg',
    degree: ['MBBS', 'MD'],
    appointments: [124]
  },
  
  {
    id: 2,
    name: 'Anita Sharma',
    experience: 15,
    department: 'General Physician',
    url: '',
    degree: ['MBBS'],
    appointments: []
  },
  {
    id: 3,
    name: 'Rahul Mehta',
    experience: 10,
    department: 'Neurology',
    url: '',
    degree: ['MBBS', 'DM'],
    appointments: []
  }
];
