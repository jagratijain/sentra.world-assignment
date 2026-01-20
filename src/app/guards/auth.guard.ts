import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// protects dashboard route
export const authGuard: CanActivateFn = () => {
  let auth = inject(AuthService);
  let router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // not logged in, go to login
  router.navigate(['/login']);
  return false;
};

// protects login route (if already logged in)
export const guestGuard: CanActivateFn = () => {
  let auth = inject(AuthService);
  let router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }

  // already logged in, go to dashboard
  router.navigate(['/dashboard']);
  return false;
};
