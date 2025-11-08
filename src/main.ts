import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ApplicationRef } from '@angular/core';
import { Auth } from './app/services/auth/auth';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

async function bootstrap() {
  try {
    // 1. Arrancamos la aplicación, pero obtenemos una referencia a ella.
    const appRef: ApplicationRef = await bootstrapApplication(App, appConfig);

    // 2. Obtenemos una instancia del AuthService del inyector de la aplicación.
    const authService = appRef.injector.get(Auth);

    // 3. LLAMAMOS Y ESPERAMOS a que la inicialización del estado de autenticación termine.
    await authService.loadUserFromToken();

  } catch (err) {
    console.error('Error durante el arranque de la aplicación', err);
  }
}

bootstrap();


