import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private toggleSubject = new Subject<void>();

  public toggle$ = this.toggleSubject.asObservable();

  constructor() {}

  /**
   * Este método será llamado por el HeaderComponent para emitir la señal
   * de abrir/cerrar el sidenav.
   *
   * This method will be called by the HeaderComponent to emit the signal
   * to open/close the sidenav.
   */
  public toggle(): void {
    this.toggleSubject.next();
  }
}
