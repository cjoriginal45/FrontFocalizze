import { Component, inject, Input } from '@angular/core';
import { UserInterface } from '../../../interfaces/UserInterface';
import { FollowButtonService } from '../../../services/follow-button/follow-button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-follow-button',
  imports: [CommonModule],
  templateUrl: './follow-button.html',
  styleUrl: './follow-button.css'
})
export class FollowButton {
// --- INYECCIÓN DE SERVICIOS ---
private followService = inject(FollowButtonService);

isLoading = false;
isHovering = false;

@Input({ required: true }) user!: UserInterface;

constructor() {}

toggleFollow(): void {
  if (this.isLoading) return;
  this.isLoading = true;
  const previousFollowingState = this.user.isFollowing;
  this.user.isFollowing = !this.user.isFollowing;

  this.followService.toggleFollow(this.user.username).subscribe({
    next: () => {
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error al actualizar el estado de seguimiento', err);
      this.user.isFollowing = previousFollowingState;
      this.isLoading = false;
    }
  });
}
}
