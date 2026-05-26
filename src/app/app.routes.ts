import { Routes } from '@angular/router';
import { DoctorDashboard } from './components/doctor-dashboard/doctor-dashboard';
import { Home } from './components/home/home';
import { LoginDoctor } from './components/login-doctor/login-doctor';
import { LoginUser } from './components/login-user/login-user';
import { RegisterUser } from './components/register-user/register-user';
import { guestGuard } from './guards/guest-guard';
import { patientGuard } from './guards/patient-guard';
import { doctorGuard } from './guards/doctor-guard';

export const routes: Routes = [
    { path: "", component: Home },
    { path: 'login-user', component: LoginUser, canActivate:[guestGuard]},
    { path: 'login-doctor', component: LoginDoctor, canActivate:[guestGuard]},
    { path: 'register-user', component: RegisterUser, canActivate:[guestGuard]},

    { 
        path: 'patient', 
        loadComponent: () => import('./components/patient-dashboard/patient-dashboard').then(r => r.PatientDashboard),
        canActivate: [patientGuard]
    },
    { 
        path: 'book', 
        loadComponent: () => import('./components/bookappointment/bookappointment').then(r => r.BookAppointment),
        canActivate: [patientGuard]
    },
    { 
        path: 'modify/:appointmentId', 
        loadComponent: () => import('./components/modifyappointment/modifyappointment').then(r => r.Modifyappointment),
        canActivate: [patientGuard]
    },
    { 
        path: 'view-prescription',
        loadComponent: () => import('./components/view-prescription/view-prescription/view-prescription').then(r => r.ViewPrescription),
        canActivate: [patientGuard]
    },
    
    { 
        path: "doctor", 
        component: DoctorDashboard,
        canActivate: [doctorGuard]
    },

    { path: '**', redirectTo: '/', pathMatch: 'full' }
];