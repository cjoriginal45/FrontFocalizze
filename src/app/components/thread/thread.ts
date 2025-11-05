import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  WritableSignal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Like } from '../../services/likeService/like';
import { Interaction } from '../../services/interactionService/interaction';
import { threadService } from '../../services/thread/thread';
import { Save } from '../../services/saveService/save';
import { ThreadState } from '../../services/thread-state/thread-state';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-thread',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './thread.html',
  styleUrl: './thread.css',
})
export class Thread implements OnInit {
  // --- INYECCIONES ---
  private likeService = inject(Like);
  private interactionService = inject(Interaction);
  private threadService = inject(threadService);
  private saveService = inject(Save);
  private threadStateService = inject(ThreadState);

  // --- INPUT: SOLO EL ID ---
  @Input({ required: true }) threadId!: number;

  // --- SEÑAL DE DATOS (LA FUENTE DE LA VERDAD PARA LA PLANTILLA) ---
  @Output() openComments = new EventEmitter<number>();
  public threadSignal!: WritableSignal<FeedThreadDto>;

  // --- ESTADO LOCAL (SOLO PARA ESTE COMPONENTE) ---
  isExpanded = false;
  isLoadingDetails = false;
  isFullyLoaded = false;

  ngOnInit(): void {
    const signal = this.threadStateService.getThreadSignal(this.threadId);
    if (!signal) {
      console.error(`Error: No se encontró la señal para el hilo con ID ${this.threadId}.`);
      return;
    }
    this.threadSignal = signal;
  }

  toggleLike(): void {
    if (!this.threadSignal) return;
    const currentThread = this.threadSignal();
    const previousState = currentThread.isLiked;
    const previousCount = currentThread.stats.likes;
    const newLikedState = !previousState;
    const newLikeCount = previousCount + (newLikedState ? 1 : -1);

    this.threadStateService.updateLikeState(this.threadId, newLikedState, newLikeCount);

    this.likeService.toggleLike(this.threadId).subscribe({
      next: () => {
        this.interactionService.notifyLikeToggled(this.threadId, newLikedState);
      },
      error: (err) => {
        console.error('Error en API de Like, revirtiendo estado.', err);
        this.threadStateService.updateLikeState(this.threadId, previousState, previousCount);
      },
    });
  }

  // (La lógica de toggleSave se adaptaría de forma idéntica a toggleLike)

  toggleExpansion(): void {
    if (!this.threadSignal) return;
    if (this.isExpanded) {
      this.isExpanded = false;
      return;
    }
    if (this.isFullyLoaded) {
      this.isExpanded = true;
      return;
    }

    this.isLoadingDetails = true;
    this.isExpanded = true; // Expandimos para mostrar el spinner
    this.threadService.getThreadById(this.threadId).subscribe({
      next: (threadData: FeedThreadDto) => {
        // Actualizamos el store centralizado con los datos completos
        this.threadStateService.updateThreadData(this.threadId, threadData);
        this.isFullyLoaded = true;
        this.isLoadingDetails = false;
      },
      error: (err: any) => {
        console.error('Error al expandir el hilo', err);
        this.isLoadingDetails = false;
        this.isExpanded = false; // Colapsamos si hay error
      },
    });
  }

  // Lógica para alternar el estado de guardado
  toggleSave(): void {
    if (!this.threadSignal) return;
    const currentThread = this.threadSignal();
    const previousState = currentThread.isSaved;
    const newSavedState = !previousState;

    this.threadSignal.update((thread) => ({ ...thread, isSaved: newSavedState }));

    this.saveService.toggleSave(this.threadId).subscribe({
      next: () => {
        this.interactionService.notifySaveToggled(this.threadId, newSavedState);
      },
      error: (err) => {
        console.error('Error en API de Save, revirtiendo estado.', err);
        this.threadSignal!.update((thread) => ({ ...thread, isSaved: previousState }));
      },
    });
  }

  onCommentClick(): void {
    // No es necesario 'if (!this.threadSignal) return;' porque el botón no se renderizaría si no hay señal
    this.openComments.emit(this.threadId);
  }
}
