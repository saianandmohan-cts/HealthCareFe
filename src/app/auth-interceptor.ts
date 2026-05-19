import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const router = inject(Router);
  
  const newReq = req.clone({
    withCredentials : true
  })


  return next(newReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        router.navigate(['/login'],
          { queryParams: { msg: 'Session Expired! Login again' } }
        );
    }
  
  
        return throwError(()=>error);
      })
    );
  };
