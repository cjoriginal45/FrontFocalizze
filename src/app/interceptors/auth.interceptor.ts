import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth/auth';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
 // Inyectamos los servicios que necesitamos dentro del interceptor
 const authService = inject(Auth);
 const router = inject(Router);
 
 // Leemos el token del almacenamiento local
 const token = localStorage.getItem('jwt_token');

 // Si no hay token, simplemente dejamos pasar la petición
 if (!token) {
   return next(req);
 }

 // Si hay token, clonamos la petición y añadimos la cabecera
 const clonedReq = req.clone({
   headers: req.headers.set('Authorization', `Bearer ${token}`)
 });

 // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA! ---
 // Pasamos la petición clonada y usamos 'pipe' para manejar la respuesta.
 return next(clonedReq).pipe(
   catchError((error: HttpErrorResponse) => {
     // Verificamos si el error es un 401 Unauthorized
     if (error.status === 401) {
       // Si es un error 401, significa que el token es inválido o ha expirado.
       console.log('Token expirado o inválido. Cerrando sesión.');
       
       // 1. Llamamos al método logout del AuthService.
       //    Esto eliminará el token corrupto de localStorage y actualizará la señal 'isLoggedIn'.
       authService.logout();
       
       // 2. Redirigimos al usuario a la página de login.
       //    (Esto ya lo hace el método logout, pero es bueno ser explícito)
       router.navigate(['/login']);
     }
     
     // Re-lanzamos el error para que el servicio que hizo la llamada original también pueda manejarlo si es necesario.
     return throwError(() => error);
   })
 );
};