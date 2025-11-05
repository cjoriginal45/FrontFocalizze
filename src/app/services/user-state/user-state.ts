import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserInterface } from '../../interfaces/UserInterface';

@Injectable({
  providedIn: 'root'
})
export class UserState {
  private userMap = new Map<string, WritableSignal<UserInterface>>(); // Clave: username

  constructor() {}

  /**
   * Carga o actualiza usuarios en el store.
   */
  loadUsers(users: UserInterface[]): void {
    users.forEach(user => {
      if (!this.userMap.has(user.username)) {
        this.userMap.set(user.username, signal(user));
      } else {
        // Actualiza el usuario existente pero preserva el estado 'isFollowing' local
        this.userMap.get(user.username)!.update(currentUser => ({
          ...user,
          isFollowing: currentUser.isFollowing
        }));
      }
    });
  }

  /**
   * Obtiene la señal de un usuario por su username.
   */
  getUserSignal(username: string): WritableSignal<UserInterface> | undefined {
    return this.userMap.get(username);
  }

  /**
   * Actualiza el estado de 'isFollowing' para un usuario.
   * Esto notificará a TODOS los componentes que muestren a este usuario.
   */
  updateFollowingState(username: string, isFollowing: boolean): void {
    const userSignal = this.userMap.get(username);
    if (userSignal) {
      userSignal.update(user => ({
        ...user,
        isFollowing: isFollowing
      }));
      console.log(`[UserState] Estado de seguimiento para ${username} actualizado a ${isFollowing}`);
    }
  }  
}
