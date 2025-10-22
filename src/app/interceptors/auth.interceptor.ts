import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Lee el token del almacenamiento local.
  // Reads the token from local storage.
  const token = localStorage.getItem('jwt_token');

  // Si el token existe, clona la petición y añade la cabecera de autorización.
  // If the token exists, clone the request and add the Authorization header.
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  // Si no hay token, simplemente deja pasar la petición original.
  // If there is no token, just let the original request pass through.
  return next(req);
};