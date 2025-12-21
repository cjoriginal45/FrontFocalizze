import {
  Component,
  inject,
  signal,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { FollowButtonService } from '../../../services/follow-button/follow-button';
import { ConfirmMatDialog } from '../../mat-dialog/mat-dialog/mat-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserState } from '../../../services/user-state/user-state';
import { CategoryState } from '../../../services/category-state/category-state';
import { Auth } from '../../../services/auth/auth';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface DisplayableFollow {
  name: string;
  isFollowing: boolean;
}

@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [MatDialogModule, TranslateModule],
  templateUrl: './follow-button.html',
  styleUrl: './follow-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowButton {
  // --- INYECCIÓN DE SERVICIOS (MODERN CORE) ---
  private readonly followService = inject(FollowButtonService);
  private readonly dialog = inject(MatDialog);
  private readonly userStateService = inject(UserState);
  private readonly categoryStateService = inject(CategoryState);
  private readonly authService = inject(Auth);
  private readonly destroyRef = inject(DestroyRef);

  // --- SIGNAL INPUTS (ANGULAR 20 STYLE) ---
  public readonly type = input.required<'user' | 'category'>();
  public readonly identifier = input.required<string | number>();

  // --- SIGNAL OUTPUT ---
  public readonly followStateChanged = output<boolean>();

  // --- ESTADO LOCAL ---
  public readonly isLoading = signal(false);
  public readonly isHovering = signal(false);

  /**
   * SEÑAL COMPUTADA DECLARATIVA
   * Reemplaza la lógica imperativa del ngOnInit.
   * Se recalcula automáticamente si el tipo, identificador o los estados globales cambian.
   */
  public readonly displaySignal = computed<DisplayableFollow | null>(() => {
    const type = this.type();
    const id = this.identifier();

    if (type === 'user') {
      const user = this.userStateService.getUserSignal(id as string);
      return user ? { name: user().displayName, isFollowing: user().isFollowing } : null;
    } else {
      const category = this.categoryStateService.getCategorySignal(id as number);
      return category
        ? { name: category().name, isFollowing: category().isFollowedByCurrentUser }
        : null;
    }
  });

  // Maneja el clic en el botón de seguir/dejar de seguir
  public onClickFollow(): void {
    const entity = this.displaySignal();
    if (this.isLoading() || !entity) return;

    if (entity.isFollowing) {
      this.openUnfollowConfirmDialog(entity);
    } else {
      this.executeToggleFollow(entity);
    }
  }

  // Muestra el diálogo de confirmación para dejar de seguir
  private openUnfollowConfirmDialog(entity: DisplayableFollow): void {
    this.dialog
      .open(ConfirmMatDialog, {
        width: '350px',
        data: {
          title: `Dejar de seguir a ${this.type() === 'user' ? '@' : ''}${entity.name}`,
          message: `¿Estás seguro? Su contenido ya no aparecerá en tu feed principal.`,
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: boolean) => {
        if (result) this.executeToggleFollow(entity);
      });
  }

  // Ejecuta la acción de seguir/dejar de seguir con actualización optimista
  private executeToggleFollow(entity: DisplayableFollow): void {
    this.isLoading.set(true);
    const previousState = entity.isFollowing;
    const newState = !previousState;

    this.updateOptimisticState(newState);

    this.followService
      .toggleFollow(this.type(), this.identifier())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.followStateChanged.emit(newState);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(`Error en toggleFollow:`, err);
          this.updateOptimisticState(previousState); // Reversión
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Centraliza la actualización optimista del estado global
   */
  private updateOptimisticState(isFollowing: boolean): void {
    const id = this.identifier();
    if (this.type() === 'user') {
      this.userStateService.updateFollowingState(id as string, isFollowing);
      
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const diff = isFollowing ? 1 : -1;
        this.authService.updateCurrentUserCounts({ 
          followingCount: currentUser.followingCount + diff 
        });
      }
    } else {
      this.categoryStateService.updateFollowingState(id as number, isFollowing);
    }
  }
}
