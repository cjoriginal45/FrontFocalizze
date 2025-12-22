import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BottonNav } from '../../../../components/botton-nav/botton-nav';
import { Header } from '../../../../components/header/header';
import { Block } from '../../../../services/block/block';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmMatDialog } from '../../../../components/mat-dialog/mat-dialog/mat-dialog';
import { BlockedUser } from '../../../../interfaces/BlockedUser';
import { catchError, forkJoin, of } from 'rxjs';
import { MatToolbar } from "@angular/material/toolbar";
import {Location as AngularLocation } from '@angular/common';

@Component({
  selector: 'app-privacy-blocking',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, BottonNav, Header, MatToolbar],
  templateUrl: './privacy-blocking.html',
  styleUrl: './privacy-blocking.css',
})
export class PrivacyBlocking implements OnInit {
  private blockService = inject(Block);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private location = inject(AngularLocation);

  isLoading = signal(true);
  blockedUsers = signal<BlockedUser[]>([]);

  // Mantiene los usernames de los usuarios seleccionados para desbloquear
  selectedUsernames = new Set<string>();

  constructor() {}

  ngOnInit(): void {
    this.loadBlockedUsers();
  }

  loadBlockedUsers(): void {
    this.isLoading.set(true);
    this.blockService.getBlockedUsers().subscribe({
      next: (users) => {
        this.blockedUsers.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios bloqueados', err);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Maneja la selección/deselección de un usuario en la lista.
   */
  toggleSelection(username: string): void {
    if (this.selectedUsernames.has(username)) {
      this.selectedUsernames.delete(username);
    } else {
      this.selectedUsernames.add(username);
    }
  }

  /**
   * Abre la modal de confirmación y desbloquea a los usuarios seleccionados.
   */
  unblockSelectedUsers(): void {
    const usersToUnblock = Array.from(this.selectedUsernames);
    if (usersToUnblock.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: `¿Desbloquear ${usersToUnblock.length} usuario(s)?`,
        message: 'Podrán volver a ver tu perfil e interactuar contigo.',
        confirmButtonText: 'Desbloquear',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.executeUnblock(usersToUnblock);
      }
    });
  }

  private executeUnblock(usernames: string[]): void {
    // Creamos un array de observables, uno por cada solicitud de desbloqueo.
    const unblockObservables = usernames.map(username =>
      this.blockService.toggleBlock(username).pipe(
        catchError(error => {
          console.error(`Error al desbloquear a ${username}`, error);
          return of(null); // Devuelve un observable que emite null
        })
      )
    );

    // forkJoin espera a que TODOS los observables del array se completen.
    forkJoin(unblockObservables).subscribe({
      next: (results) => {
        // 'results' es un array con las respuestas de cada llamada.
        const successfulUnblocks = usernames.filter((_, index) => results[index] !== null);

        if (successfulUnblocks.length > 0) {
          // Actualizamos la UI solo con los que se desbloquearon con éxito.
          this.blockedUsers.update(currentUsers =>
            currentUsers.filter(user => !successfulUnblocks.includes(user.username))
          );
          this.selectedUsernames.clear();
          this.snackBar.open(`${successfulUnblocks.length} usuario(s) desbloqueado(s).`, 'Cerrar', { duration: 3000 });
        }
        
        if (successfulUnblocks.length < usernames.length) {
          this.snackBar.open('Algunos usuarios no pudieron ser desbloqueados.', 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        // Este bloque de error general es un fallback, pero el catchError individual
        // debería prevenir que se llegue aquí a menos que haya un problema mayor.
        console.error("Error mayor durante el proceso de desbloqueo", err);
        this.snackBar.open('Ocurrió un error inesperado.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
