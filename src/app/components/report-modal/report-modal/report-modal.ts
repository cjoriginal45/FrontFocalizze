import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { ReportRequest } from '../../../interfaces/ReportRequest';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportReason } from '../../../interfaces/ReportReason';
import { Report } from '../../../services/report/report';

@Component({
  selector: 'app-report-modal',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './report-modal.html',
  styleUrl: './report-modal.css',
})
export class ReportModal {
  private reportService = inject(Report);
  private snackBar = inject(MatSnackBar);

  // Mapeamos el enum a un array para el *ngFor
  reasons = Object.values(ReportReason);
  
  selectedReason: ReportReason | null = null;
  description: string = '';
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<ReportModal>,
    @Inject(MAT_DIALOG_DATA) public data: { username: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.selectedReason) return;

    this.isSubmitting = true;
    const request: ReportRequest = {
      reason: this.selectedReason,
      description: this.description
    };

    this.reportService.reportUser(this.data.username, request).subscribe({
      next: () => {
        this.snackBar.open('Reporte enviado correctamente.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error enviando reporte', err);
        this.snackBar.open('Error al enviar el reporte.', 'Cerrar', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }
}
