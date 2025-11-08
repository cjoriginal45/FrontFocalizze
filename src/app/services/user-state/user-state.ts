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
  updateFollowCounts(username: string, change: { followers?: number, following?: number }): void {
    const userSignal = this.userMap.get(username);
    if (userSignal) {
      userSignal.update(user => ({
        ...user,
        followersCount: change.followers ?? user.followersCount, // Actualiza si se provee
        followingCount: change.following ?? user.followingCount,
      }));
    }
  } 

  updateFollowingState(username: string, isFollowing: boolean): void {
    // 1. Buscamos la señal del usuario en nuestro mapa.
    const userSignal = this.userMap.get(username);

    // 2. Si la señal existe, la actualizamos.
    if (userSignal) {
      // 'update' es el método de las señales para modificar su valor de forma segura.
      // Crea una nueva copia del objeto UserInterface con la propiedad 'isFollowing' actualizada.
      userSignal.update(user => ({
        ...user,
        isFollowing: isFollowing
      }));
    } else {
      console.warn(`[UserState] Se intentó actualizar el estado de seguimiento para @${username}, pero no se encontró en el store.`);
    }
  }
}
