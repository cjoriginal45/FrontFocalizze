import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { ReportResponse } from '../../../interfaces/ReportResponse';
import { Admin } from '../../../services/admin/admin';

@Component({
  selector: 'app-report-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './report-details-modal.html',
  styleUrl: './report-details-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailsModal {
  // Inyección de dependencias moderna
  private adminService = inject(Admin);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<ReportDetailsModal>);

  // Inyección de datos del diálogo
  public report = inject<ReportResponse>(MAT_DIALOG_DATA);

  // Estado reactivo con Signals
  public selectedDays = signal<number>(1);
  public isLoading = signal<boolean>(false);

  dismissReport(): void {
    this.process('DISMISS');
  }

  suspendUser(): void {
    this.process('SUSPEND', this.selectedDays());
  }

  private process(action: 'DISMISS' | 'SUSPEND', days?: number): void {
    this.isLoading.set(true);

    this.adminService
      .processReport(this.report.id, action, days)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const msg = action === 'DISMISS' ? 'Reporte ignorado.' : 'Usuario suspendido.';
          this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (e) => {
          console.error('ERROR:' + e.message);
          this.snackBar.open('Error al procesar.', 'Cerrar', { duration: 3000 });
        },
      });
  }
}
