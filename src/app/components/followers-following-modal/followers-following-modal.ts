import { Component, Inject, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { ProfileService } from '../../services/profile/profile';
import { UserSummary } from '../../interfaces/UserSummary';
import { FollowButton } from '../follow-button/follow-button/follow-button';
import { UserState } from '../../services/user-state/user-state';
import { Auth } from '../../services/auth/auth';
import { UserInterface } from '../../interfaces/UserInterface';
import { TranslateModule } from '@ngx-translate/core';

export interface FollowersModalData {
  username: string;
  initialTab: 'followers' | 'following';
}

@Component({
  selector: 'app-followers-following-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FollowButton,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './followers-following-modal.html',
  styleUrl: './followers-following-modal.css',
})
export class FollowersFollowingModal implements OnInit {
  private profileService = inject(ProfileService);
  private userStateService = inject(UserState);
  authService = inject(Auth);

  // Estados reactivos
  isLoading = signal(true);
  selectedIndex = signal(0); // 0 = Followers, 1 = Following

  // Listas de usuarios
  followersList = signal<UserSummary[]>([]);
  followingList = signal<UserSummary[]>([]);

  // ¿El perfil que estamos viendo es el mío?
  isMyProfile = false;

  constructor(
    public dialogRef: MatDialogRef<FollowersFollowingModal>,
    @Inject(MAT_DIALOG_DATA) public data: FollowersModalData
  ) {
    // Detectamos si es mi perfil para saber si borrar items de la lista "Seguidos" en tiempo real
    const currentUser = this.authService.getCurrentUser();
    this.isMyProfile = currentUser?.username === data.username;

    // Configurar pestaña inicial
    this.selectedIndex.set(data.initialTab === 'following' ? 1 : 0);
  }

  ngOnInit(): void {
    // Cargamos la data de la pestaña inicial
    this.loadDataForTab(this.selectedIndex());
  }

  onTabChange(index: number): void {
    this.selectedIndex.set(index);
    this.loadDataForTab(index);
  }

  loadDataForTab(index: number): void {
    this.isLoading.set(true);
    const username = this.data.username;

    if (index === 0) {
      // Followers
      this.profileService.getFollowers(username).subscribe({
        next: (users) => {
          this.followersList.set(users);
          this.populateUserState(users);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    } else {
      // Following
      this.profileService.getFollowing(username).subscribe({
        next: (users) => {
          this.followingList.set(users);
          this.populateUserState(users);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }

  // Cargamos los usuarios en el UserState para que el botón de FollowButton funcione
  // ya que FollowButton depende del UserState para su reactividad.
  private populateUserState(users: UserSummary[]) {
    const userInterfaces: UserInterface[] = users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      isFollowing: u.isFollowing,
      followersCount: 0, // No los necesitamos en el modal
      followingCount: 0, // No los necesitamos en el modal
    }));
    this.userStateService.loadUsers(userInterfaces);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Maneja el evento cuando cambia el estado de seguimiento dentro del modal.
   * Si estamos en MI perfil, en la pestaña "Seguidos" y dejo de seguir a alguien,
   * esa persona debe desaparecer de la lista visualmente.
   */
  handleFollowStateChange(usernameChanged: string, isNowFollowing: boolean): void {
    const currentTab = this.selectedIndex();

    // Caso especial: Estoy en MI perfil, viendo MIS seguidos.
    if (this.isMyProfile && currentTab === 1 && !isNowFollowing) {
      // Remover de la lista visualmente
      this.followingList.update((list) => list.filter((u) => u.username !== usernameChanged));

      // Actualizar contador del perfil de fondo (se hace via UserState -> ProfileComponent)
      // ProfileComponent ya escucha UserState changes, pero necesitamos asegurar
      // que el contador 'following' de MI perfil baje.
      // El FollowButton ya actualiza el 'currentUser' en AuthService, lo cual es correcto.
    }
  }
}
