import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const patientGuard: CanActivateFn = (route, state) => {
 const authService = inject(Auth);
  const router = inject(Router);

  const checkRoleAndAllow = () => {
    if (authService.getRole() === 'PATIENT') {
      return true;
    }
    if (authService.getRole() === 'DOCTOR') {
      router.navigateByUrl('/doctor');
      return false;
    }
    router.navigateByUrl('/login-user');
    return false;
  };

  if (authService.authenticated()) {
    return checkRoleAndAllow();
  }

  return authService.checkSession().pipe(
    map(() => checkRoleAndAllow()),
    catchError(() => {
      router.navigateByUrl('/login-user');
      return of(false);
    })
  );
};
