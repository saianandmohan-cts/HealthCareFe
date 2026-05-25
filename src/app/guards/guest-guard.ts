import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
 const authService = inject(Auth);
  const router = inject(Router);

  if (authService.authenticated()) {
    console.log(`🛡️ guestGuard: User already logged in as [${authService.getRole()}]. Redirecting to dashboard.`);
    
    if (authService.getRole() === 'DOCTOR') {
      router.navigateByUrl('/doctor');
    } else {
      router.navigateByUrl('/patient');
    }
    return false;
  }
  return true;
};
