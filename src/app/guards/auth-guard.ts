import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth'; 
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // 🚀 FIXED Logic: Pehle check karenge agar signals me data already true betha hai
  if (authService.authenticated()) {
    return true;
  }

  // Agar token background me check karna hai
  return authService.checkSession().pipe(
    map((res) => {
      // res.success humne auth.ts me manually true/false bhej rakha hai
      if (res && res.success === true && authService.authenticated()) {
        return true;
      } else {
        console.log("🔒 Guard Blocking: Redirecting forcefully to /login-user");
        // 🚀 FORCE REDIRECT: Use createUrlTree or forced navigation promise
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