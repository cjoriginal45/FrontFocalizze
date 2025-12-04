import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportResponse } from '../../../interfaces/ReportResponse';
import { Admin } from '../../../services/admin/admin';

@Component({
  selector: 'app-report-details-modal',
  standalone : true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, FormsModule],
  templateUrl: './report-details-modal.html',
  styleUrl: './report-details-modal.css',
})
export class ReportDetailsModal {
  private adminService = inject(Admin);
  private snackBar = inject(MatSnackBar);

  selectedDays: number = 1; // Por defecto 1 día
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ReportDetailsModal>,
    @Inject(MAT_DIALOG_DATA) public report: ReportResponse
  ) {}

  dismissReport() {
    this.process('DISMISS');
  }

  suspendUser() {
    this.process('SUSPEND', this.selectedDays);
  }

  private process(action: 'DISMISS' | 'SUSPEND', days?: number) {
    this.isLoading = true;
    this.adminService.processReport(this.report.id, action, days).subscribe({
      next: () => {
        this.snackBar.open(action === 'DISMISS' ? 'Reporte ignorado.' : 'Usuario suspendido.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true); // Retorna true para indicar que se actualice la lista
      },
      error: () => {
        this.snackBar.open('Error al procesar.', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
