import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (user && user.role === 'ADMIN') {
    return true;
  }

  // Si no es admin, redirigir al feed o home
  router.navigate(['/feed']);
  return false;
};
