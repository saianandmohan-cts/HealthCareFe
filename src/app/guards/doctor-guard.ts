import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Auth } from '../services/auth';

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
