import { Routes } from '@angular/router';
import { DoctorDashboard } from './components/doctor-dashboard/doctor-dashboard';
import { Home } from './components/home/home';
import { LoginDoctor } from './components/login-doctor/login-doctor';
import { LoginUser } from './components/login-user/login-user';
import { RegisterUser } from './components/register-user/register-user';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {path:"",component:Home},
    {path:'login-user', component:LoginUser},
    {path:'login-doctor', component:LoginDoctor},
    {path:'register-user', component:RegisterUser},

    {path:'patient',loadComponent: ()=>import('./components/patient-dashboard/patient-dashboard').then(r=>r.PatientDashboard)},
    {path:'book',loadComponent: ()=>import('./components/bookappointment/bookappointment').then(r=>r.BookAppointment)},
    {path: 'modify/:appointmentId',loadComponent:()=>import('./components/modifyappointment/modifyappointment').then(r=>r.Modifyappointment)},
    { 
      path: 'view-prescription',
      loadComponent: () => import('./components/view-prescription/view-prescription/view-prescription').then(r=>r.ViewPrescription) 
    },
    
    {path:"doctor",component:DoctorDashboard},

    { path: '**', redirectTo: '/', pathMatch: 'full' }
];


