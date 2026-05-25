import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const doctorGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const checkRoleAndAllow = () => {
    if (authService.getRole() === 'DOCTOR') {
      return true;
    }
    if (authService.getRole() === 'PATIENT') {
      router.navigateByUrl('/patient');
      return false;
    }
    router.navigateByUrl('/login-doctor');
    return false;
  };

  if (authService.authenticated()) {
    return checkRoleAndAllow();
  }

  return authService.checkSession().pipe(
    map(() => checkRoleAndAllow()),
    catchError(() => {
      router.navigateByUrl('/login-doctor');
      return of(false);
    })
  );
};
