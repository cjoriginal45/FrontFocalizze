import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
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
import { FollowButton } from '../follow-button/follow-button/follow-button';
import { UserState } from '../../services/user-state/user-state';
import { UserInterface } from '../../interfaces/UserInterface';
import { Auth } from '../../services/auth/auth';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { EditThreadModal } from '../edit-thread-modal/edit-thread-modal/edit-thread-modal';
import { ThreadUpdateRequest } from '../../interfaces/ThreadUpdateRequest';
import { ConfirmMatDialog } from '../mat-dialog/mat-dialog/mat-dialog';
import { TimeAgoPipe } from '../../pipes/time-ago/time-ago-pipe';
import { ViewTracking } from '../../services/viewTracking/view-tracking';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { UserSearch } from '../../interfaces/UserSearch';
import { Search } from '../../services/search/search';
import { MentionLinkerPipe } from "../../pipes/mention-linker-pipe";
import { Block } from '../../services/block/block';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ReportModal } from '../report-modal/report-modal/report-modal';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    FollowButton,
    MatMenuModule,
    TimeAgoPipe,
    MentionLinkerPipe,
    TranslateModule
],
  templateUrl: './thread.html',
  styleUrl: './thread.css',
})
export class Thread {
  // --- INYECCIONES (sin cambios) ---
  private likeService = inject(Like);
  private interactionService = inject(Interaction);
  private threadService = inject(threadService);
  private saveService = inject(Save);
  private threadStateService = inject(ThreadState);
  private userStateService = inject(UserState);
  public authService = inject(Auth);
  private dialog = inject(MatDialog);
  private viewTrackingService = inject(ViewTracking);
  private blockService = inject(Block); 
  private snackBar = inject(MatSnackBar); 

    // --- NUEVAS PROPIEDADES PARA MENCIONES ---
    @ViewChild('textarea', { read: ElementRef }) textareaRef!: ElementRef<HTMLTextAreaElement>;
    @ViewChild('mentionsPanel') mentionsPanel!: TemplateRef<any>;

  private overlayRef: OverlayRef | null = null;
  mentionResults: UserSearch[] = [];
  isMentionPanelOpen = false;

  // --- INPUT CON SETTER (sin cambios) ---
  @Input({ required: true })
  set threadId(id: number) {
    this._threadId = id;
    this.connectToState();
  }
  get threadId(): number {
    return this._threadId;
  }
  private _threadId!: number;

  @Output() openComments = new EventEmitter<{ threadId: number; username: string }>();

  // --- SEÑALES INTERNAS (sin cambios) ---
  public threadSignal: WritableSignal<FeedThreadDto | null> = signal(null);
  public userSignal: WritableSignal<UserInterface | null> = signal(null);

  // --- ESTADO LOCAL (sin cambios) ---
  isExpanded = false;
  isLoadingDetails = false;
  isFullyLoaded = false;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private searchService: Search
  ) {}

  private connectToState(): void {
    const signalFromState = this.threadStateService.getThreadSignal(this.threadId);

    if (signalFromState) {
      this.threadSignal = signalFromState as WritableSignal<FeedThreadDto | null>;
      const userSignalFromState = this.userStateService.getUserSignal(
        this.threadSignal()!.user.username
      );
      if (userSignalFromState) {
        this.userSignal = userSignalFromState as WritableSignal<UserInterface | null>;
      }
    } else {
      effect(
        () => {
          const newSignalFromState = this.threadStateService.getThreadSignal(this.threadId);
          if (newSignalFromState && !this.threadSignal()) {
            this.threadSignal = newSignalFromState as WritableSignal<FeedThreadDto | null>;

            const userSignalFromState = this.userStateService.getUserSignal(
              this.threadSignal()!.user.username
            );
            if (userSignalFromState) {
              this.userSignal = userSignalFromState as WritableSignal<UserInterface | null>;
            }
          }
        },
        { allowSignalWrites: true }
      );
    }
  }

  // --- MÉTODOS DE ACCIÓN CORREGIDOS ---

  toggleLike(): void {
    const currentThread = this.threadSignal();
    // --- CORRECCIÓN: Comprobamos si el hilo es nulo antes de continuar ---
    if (!currentThread) return;

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

  toggleExpansion(): void {
    const currentThread = this.threadSignal();
    // --- CORRECCIÓN ---
    if (!currentThread) return;

    if (this.isExpanded) {
      this.isExpanded = false;
      return;
    }

    if (this.viewTrackingService.hasBeenViewed(this.threadId)) {
      this.isExpanded = true;
      return;
    }

    this.isLoadingDetails = true;
    this.isExpanded = true;

    this.threadService.getThreadById(this.threadId).subscribe({
      next: (threadData) => {
        this.threadStateService.updateThreadData(this.threadId, threadData);
        this.viewTrackingService.markAsViewed(this.threadId);
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error('Error al expandir el hilo', err);
        this.isLoadingDetails = false;
        this.isExpanded = false;
      },
    });
  }

  toggleSave(): void {
    const currentThread = this.threadSignal();
    // --- CORRECCIÓN ---
    if (!currentThread) return;

    const previousState = currentThread.isSaved;
    const newSavedState = !previousState;

    // Usamos 'update' para actualizar la señal. Es más seguro.
    this.threadSignal.update((thread) => (thread ? { ...thread, isSaved: newSavedState } : null));

    this.saveService.toggleSave(this.threadId).subscribe({
      next: () => {
        this.interactionService.notifySaveToggled(this.threadId, newSavedState);
      },
      error: (err) => {
        console.error('Error en API de Save, revirtiendo estado.', err);
        this.threadSignal.update((thread) =>
          thread ? { ...thread, isSaved: previousState } : null
        );
      },
    });
  }

  onCommentClick(): void {
    const thread = this.threadSignal();
    
    if (thread) {
      this.openComments.emit({ 
        threadId: this.threadId, 
        username: thread.user.username 
      });
    }
  }

  openEditModal(): void {
    const threadToEdit = this.threadSignal();
    // --- CORRECCIÓN ---
    if (!threadToEdit) return;

    const dialogRef = this.dialog.open(EditThreadModal, {
      width: '600px',
      data: { thread: threadToEdit },
      panelClass: 'thread-modal-panel',
    });

    dialogRef.afterClosed().subscribe((result: ThreadUpdateRequest | undefined) => {
      if (!result) return;
      this.threadService.updateThread(this.threadId, result).subscribe({
        next: (updatedThreadFromApi) => {
          this.threadStateService.updateThreadData(this.threadId, updatedThreadFromApi);
          console.log('Hilo actualizado con éxito en el store.');
        },
        error: (err) => {
          console.error('Error al actualizar el hilo', err);
        },
      });
    });
  }

  openDeleteConfirm(): void {
    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: '¿Eliminar Hilo?',
        message: 'Esta acción no se puede deshacer. El hilo será eliminado permanentemente.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.threadService.deleteThread(this.threadId).subscribe({
          next: () => {
            console.log('Hilo eliminado con éxito');
            this.threadStateService.removeThread(this.threadId);
          },
          error: (err) => console.error('Error al eliminar el hilo', err),
        });
      }
    });
  }

   openReportModal(): void {
      const username = this.threadSignal()?.user.username;
  
      if (!username) return;
  
    this.dialog.open(ReportModal, {
      width: '500px',
      data: { username: username }
    });
    }

  blockUser(): void {
    const threadData = this.threadSignal();
    if (!threadData) return;

    const userToToggle = threadData.user;
    const isBlocking = !userToToggle.isBlocked;

    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: isBlocking ? `¿Bloquear a @${userToToggle.username}?` : `¿Desbloquear a @${userToToggle.username}?`,
        message: isBlocking
          ? `No volverás a ver su contenido y esta persona no podrá interactuar contigo.`
          : `Volverás a ver el contenido de @${userToToggle.username}. Si quieres volver a seguirle, deberás hacerlo desde su perfil.`,
        confirmButtonText: isBlocking ? 'Bloquear' : 'Desbloquear',
        confirmButtonColor: 'warn'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeToggleBlock(userToToggle.username, isBlocking);
      }
    });
  }

  private executeToggleBlock(username: string, isBlocking: boolean): void {
    this.blockService.toggleBlock(username).subscribe({
      next: (response) => {
        if (response.isBlocked) {
          // Si el resultado final es 'bloqueado', ocultamos todo su contenido.
          this.threadStateService.removeThreadsByAuthor(username);
          this.userStateService.updateBlockedState(username, true);
          this.snackBar.open(`Has bloqueado a @${username}. Su contenido ha sido ocultado.`, 'Cerrar', { duration: 5000 });
        } else {
          // Si desbloqueamos, solo actualizamos el estado para que el botón cambie.
          // No volvemos a cargar su contenido automáticamente, el usuario tendrá que recargar o navegar.
          this.userStateService.updateBlockedState(username, false);
          this.snackBar.open(`Has desbloqueado a @${username}.`, 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error("Error en la acción de bloqueo", err);
        this.snackBar.open('No se pudo completar la acción.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openReportThreadModal(): void {
    const threadId = this.threadId;
    if (!threadId) return;

    this.dialog.open(ReportModal, {
      width: '500px',
      data: { threadId: threadId } 
    });
  }
}
