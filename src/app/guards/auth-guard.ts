import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth'; 
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.authenticated()) {
    return true;
  }

  return authService.checkSession().pipe(
    map((res) => {
      if (res && res.success === true && authService.authenticated()) {
        return true;
      } else {
        console.log(" Guard Blocking: Redirecting forcefully to /login-user");
        router.navigateByUrl('/login-user');
        return false;
      }
    }),
    catchError(() => {
      console.log("🔒 Guard Error Blocking: Redirecting to /login-user");
      router.navigateByUrl('/login-user');
      return of(false);
    })
  );
};