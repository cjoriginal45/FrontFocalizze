import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface FollowersModalData {
  username: string;
  initialTab: 'followers' | 'following';
}

@Component({
  selector: 'app-followers-following-modal',
  standalone: true,
  imports: [
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowersFollowingModal implements OnInit {
  // --- Inyección de Servicios ---
  private readonly profileService = inject(ProfileService);
  private readonly userStateService = inject(UserState);
  private readonly destroyRef = inject(DestroyRef);
  public readonly authService = inject(Auth);
  public readonly dialogRef = inject(MatDialogRef<FollowersFollowingModal>);
  public readonly data: FollowersModalData = inject(MAT_DIALOG_DATA);

  // --- Estados Reactivos (Signals) ---
  public readonly isLoading = signal(true);
  public readonly selectedIndex = signal(0);
  public readonly followersList = signal<UserSummary[]>([]);
  public readonly followingList = signal<UserSummary[]>([]);
  public readonly isMyProfile = signal(false);

  ngOnInit(): void {
    this.checkOwnership();
    this.initializeTabIndex();
    this.loadDataForTab(this.selectedIndex());
  }

  private checkOwnership(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isMyProfile.set(currentUser?.username === this.data.username);
  }

  private initializeTabIndex(): void {
    this.selectedIndex.set(this.data.initialTab === 'following' ? 1 : 0);
  }

  public onTabChange(index: number): void {
    this.selectedIndex.set(index);
    this.loadDataForTab(index);
  }

  public loadDataForTab(index: number): void {
    this.isLoading.set(true);
    const username = this.data.username;
    const request$ =
      index === 0
        ? this.profileService.getFollowers(username)
        : this.profileService.getFollowing(username);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        if (index === 0) this.followersList.set(users);
        else this.followingList.set(users);

        this.populateUserState(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private populateUserState(users: UserSummary[]): void {
    const userInterfaces: UserInterface[] = users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      isFollowing: u.isFollowing,
      followersCount: 0,
      followingCount: 0,
    }));
    this.userStateService.loadUsers(userInterfaces);
  }

  public handleFollowStateChange(usernameChanged: string, isNowFollowing: boolean): void {
    // Si estoy en mi perfil y dejo de seguir a alguien en la pestaña "Seguidos" (index 1)
    if (this.isMyProfile() && this.selectedIndex() === 1 && !isNowFollowing) {
      this.followingList.update((list) => list.filter((u) => u.username !== usernameChanged));
    }
  }

  public onClose(): void {
    this.dialogRef.close();
  }
}
