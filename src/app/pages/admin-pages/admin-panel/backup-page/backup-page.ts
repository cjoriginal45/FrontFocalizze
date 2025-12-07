import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Header } from '../../../../components/header/header';
import { BottonNav } from '../../../../components/botton-nav/botton-nav';
import { Admin } from '../../../../services/admin/admin';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-backup-page',
  imports: [CommonModule, MatButtonModule, MatIconModule, Header, BottonNav],
  templateUrl: './backup-page.html',
  styleUrl: './backup-page.css',
})
export class BackupPage {
  private adminService = inject(Admin);
  private location = inject(Location);
  private snackBar = inject(MatSnackBar);

  isLoading = false;

  goBack(): void {
    this.location.back();
  }

  initiateBackup(): void {
    this.isLoading = true;

    this.adminService.downloadDatabaseBackup().subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob);
        this.isLoading = false;
        this.snackBar.open('Respaldo descargado exitosamente.', 'OK', { duration: 4000 });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.snackBar.open('Error al generar el respaldo. Intente más tarde.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /**
   * Crea un enlace invisible temporalmente para forzar la descarga del Blob
   */
  private downloadFile(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // CAMBIO AQUÍ: Extensión .xlsx
    const date = new Date().toISOString().slice(0, 10);
    a.download = `focalizze_reporte_${date}.xlsx`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
