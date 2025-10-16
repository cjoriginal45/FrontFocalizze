import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Responsive {
  // Un Observable que emitirá `true` si la pantalla es pequeña (móvil)
  // An Observable that will emit `true` if the screen is small (mobile)
  public isMobile$: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    // Usamos el BreakpointObserver de Angular CDK para detectar el tamaño
    // We use Angular CDK's BreakpointObserver to detect the size
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map((result) => result.matches),
      shareReplay(1) // Cachea el último valor para nuevos suscriptores / Caches the last value for new subscribers
    );
  }
}
