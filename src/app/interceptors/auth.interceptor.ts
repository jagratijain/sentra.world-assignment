import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// adds token to all http requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let authService = inject(AuthService);
  let router = inject(Router);
  let token = authService.getToken();

  // add token if exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // if 401, logout user
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};

// handles http errors
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let msg = 'Something went wrong';

      if (err.status === 0) {
        msg = 'No internet connection';
      } else if (err.status === 404) {
        msg = 'Not found';
      } else if (err.status === 500) {
        msg = 'Server error';
      }

      console.error('HTTP Error:', err.status, msg);
      return throwError(() => new Error(msg));
    })
  );
};
