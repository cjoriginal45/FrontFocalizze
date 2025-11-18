import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Auth } from '../auth/auth';
import { filter, take, tap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authReadyGuard: CanActivateFn = () => {
  const authService = inject(Auth);

  // Convertimos la señal 'authReady' en un Observable para poder usar operadores RxJS.
  return toObservable(authService.authReady).pipe(
    // 'filter' esperará hasta que el valor de authReady sea 'true'.
    filter((isReady) => isReady === true),
    // 'take(1)' asegura que el observable se complete después de emitir el primer 'true'.
    take(1)
  );
};
