import { Component, computed, EventEmitter, inject, Input, OnInit, Output, Signal, signal, WritableSignal } from '@angular/core';
import { UserInterface } from '../../../interfaces/UserInterface';
import { FollowButtonService } from '../../../services/follow-button/follow-button';
import { CommonModule } from '@angular/common';
import { ConfirmMatDialog } from '../../mat-dialog/mat-dialog/mat-dialog';
import { MatDialog } from '@angular/material/dialog';
import { UserState } from '../../../services/user-state/user-state';
import { Followable } from '../../../interfaces/Followable';
import { CategoryState } from '../../../services/category-state/category-state';
import { Auth } from '../../../services/auth/auth';
import { TranslateModule } from '@ngx-translate/core';

interface DisplayableFollow {
  name: string;
  isFollowing: boolean;
}


@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './follow-button.html',
  styleUrl: './follow-button.css'
})
export class FollowButton implements OnInit{
  // --- INYECCIÓN DE SERVICIOS ---
  private followService = inject(FollowButtonService);
  private dialog = inject(MatDialog); 
  private userStateService = inject(UserState);
  private categoryStateService = inject(CategoryState);
  private authService = inject(Auth);

  // --- INPUTS SIMPLIFICADOS ---
  @Input({ required: true }) type!: 'user' | 'category';
  @Input({ required: true }) identifier!: string | number;

  // --- OUTPUT (para notificar al padre) ---
  @Output() followStateChanged = new EventEmitter<boolean>();
  
  // --- SEÑAL INTERNA ---
  // Esta es la fuente de la verdad para la plantilla de ESTE componente.
  public userSignal: WritableSignal<UserInterface> | undefined;

  public displaySignal: Signal<DisplayableFollow | null> | undefined;

  // --- ESTADO LOCAL ---
  isLoading = false;
  isHovering = false;

  ngOnInit(): void {
    // Obtenemos la señal correcta del store
    if (this.type === 'user') {
      const userSignal = this.userStateService.getUserSignal(this.identifier as string);
      if (userSignal) {
        // --- ¡LA SOLUCIÓN! ---
        // 'computed' crea una nueva señal que depende de 'userSignal'.
        // Cada vez que 'userSignal' cambie, 'displaySignal' se recalculará.
        this.displaySignal = computed(() => ({
          name: userSignal().displayName,
          isFollowing: userSignal().isFollowing
        }));
      }
    } else if (this.type === 'category') {
      const categorySignal = this.categoryStateService.getCategorySignal(this.identifier as number);
      if (categorySignal) {
        // Hacemos lo mismo para las categorías
        this.displaySignal = computed(() => ({
          name: categorySignal().name,
          isFollowing: categorySignal().isFollowedByCurrentUser
        }));
      }

    }

    if (!this.displaySignal) {
      console.error(`FollowButton: No se encontró el estado para ${this.type} con identificador ${this.identifier}.`);
    }
  }

 

  /**
   * Gestiona el clic en el botón, mostrando una confirmación si es necesario.
   */
  onClickFollow(): void {
    if (this.isLoading || !this.displaySignal || this.displaySignal() === null) return;

    if (this.displaySignal()!.isFollowing) {
      // Pasamos el objeto, no la señal
      this.openUnfollowConfirmDialog(this.displaySignal()!);
    } else {
      this.executeToggleFollow(this.displaySignal()!);
    }
  }

  /**
   * Abre la modal de confirmación.
   */
  private openUnfollowConfirmDialog(entity: DisplayableFollow): void {
    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      width: '350px',
      data: {
        title: `Dejar de seguir a ${this.type === 'user' ? '@' : ''}${entity.name}`,
        message: `¿Estás seguro? Su contenido ya no aparecerá en tu feed principal.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.executeToggleFollow(entity);
      }
    });
  }

  /**
   * Ejecuta la lógica de la llamada a la API y actualiza el estado.
   */
  private executeToggleFollow(entity: DisplayableFollow): void {
    this.isLoading = true;
    const previousState = entity.isFollowing;
    const newState = !previousState;
  
    // --- LÓGICA DE ACTUALIZACIÓN OPTIMISTA ---

    if (this.type === 'user') {
      // 1. Actualiza el estado 'isFollowing' del usuario que se está viendo.
      this.userStateService.updateFollowingState(this.identifier as string, newState);

      // 2. Actualiza el contador 'followingCount' del usuario que está logueado.
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        // Calculamos el nuevo contador.
        const newFollowingCount = currentUser.followingCount + (newState ? 1 : -1);
        // Pedimos al AuthService que actualice su propia señal (o a un servicio de estado si es necesario).
        this.authService.updateCurrentUserCounts({ followingCount: newFollowingCount });
      }

    } else if (this.type === 'category') {
      // Actualiza el estado 'isFollowing' de la categoría.
      this.categoryStateService.updateFollowingState(this.identifier as number, newState);
    }
  
    // --- LLAMADA A LA API ---
    this.followService.toggleFollow(this.type, this.identifier).subscribe({
      next: () => {
        // La API tuvo éxito. La UI ya está actualizada optimistamente.
        this.followStateChanged.emit(newState);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(`Error al seguir/dejar de seguir ${this.type}`, err);
        
        // --- LÓGICA DE REVERSIÓN ---
        if (this.type === 'user') {
          // 1. Revierte el estado 'isFollowing' del usuario que se está viendo.
          this.userStateService.updateFollowingState(this.identifier as string, previousState);

          // 2. Revierte el contador 'followingCount' del usuario que está logueado.
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            // No necesitamos recalcular, simplemente volvemos al valor original.
            this.authService.updateCurrentUserCounts({ followingCount: currentUser.followingCount });
          }

        } else if (this.type === 'category') {
          // Revierte el estado 'isFollowing' de la categoría.
          this.categoryStateService.updateFollowingState(this.identifier as number, previousState);
        }
        
        this.isLoading = false;
      }
    });
  }
}