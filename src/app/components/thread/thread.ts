import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface ThreadDto {
  id: number;
  user: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  publicationDate: Date;
  posts: string[];
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
  isLiked: boolean;
  isSaved: boolean;
}

@Component({
  selector: 'app-thread',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './thread.html',
  styleUrl: './thread.css'
})
export class Thread {
  // @Input() permite que el componente padre (Feed) pase datos a este componente.
  // @Input() allows the parent component (Feed) to pass data to this component.
  @Input() thread!: ThreadDto;
  id = this.thread?.id;
  user = this.thread?.user;
  publicationDate = this.thread?.publicationDate;
  posts = this.thread?.posts;
  stats = this.thread?.stats;
  isLiked = this.thread?.isLiked;
  isSaved = this.thread?.isSaved;

  isExpanded = false;

  constructor() {}

  // Lógica de placeholder para las acciones.
  // Placeholder logic for actions.
  toggleLike(): void {
    this.thread.isLiked = !this.thread.isLiked;
    this.thread.stats.likes += this.thread.isLiked ? 1 : -1;
    console.log('Like toggled for thread:', this.thread.id);
  }

  toggleSave(): void {
    this.thread.isSaved = !this.thread.isSaved;
    console.log('Save toggled for thread:', this.thread.id);
  }

   // Cambia el estado de expansión.
   toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }
}
