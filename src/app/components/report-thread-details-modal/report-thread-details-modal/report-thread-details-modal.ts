import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportResponse } from '../../../interfaces/ReportResponse';
import { ThreadResponse } from '../../../interfaces/ThreadResponseDto';
import { threadService } from '../../../services/thread/thread';
import { Admin } from '../../../services/admin/admin';

@Component({
  selector: 'app-report-thread-details-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './report-thread-details-modal.html',
  styleUrls: ['./report-thread-details-modal.css']
})
export class ReportThreadDetailsModal implements OnInit {
  private adminService = inject(Admin);
  private threadService = inject(threadService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  threadData: ThreadResponse | null = null; // Para guardar los posts a editar
  
  // Modelos para los textareas de edición
  post1Content = '';
  post2Content = '';
  post3Content = '';

  constructor(
    public dialogRef: MatDialogRef<ReportThreadDetailsModal>,
    @Inject(MAT_DIALOG_DATA) public report: ReportResponse
  ) {}

  ngOnInit() {
    if (this.report.reportedThreadId) {
      // Cargamos el hilo completo para poder editarlo
      this.threadService.getThreadById(this.report.reportedThreadId).subscribe({
        next: (data) => {
          this.threadData = {
            ...data,
            author: (data as any).author || '', // Cast to 'any' to access dynamic properties
            createdAt: (data as any).createdAt || new Date().toISOString() // Cast to 'any' to access dynamic properties
          } as ThreadResponse;
          // Asumiendo que data.posts es un array de strings o objetos con content
          this.post1Content = data.posts[0] || '';
          this.post2Content = data.posts[1] || '';
          this.post3Content = data.posts[2] || '';
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Error al cargar el contenido del hilo.', 'Cerrar');
          this.isLoading = false; // Permitir al menos borrar/ignorar aunque no cargue
        }
      });
    }
  }

  dismissReport() {
    this.executeAction('DISMISS');
  }

  deleteThread() {
    if(confirm('¿Estás seguro de eliminar este hilo permanentemente?')) {
        this.executeAction('DELETE');
    }
  }

  saveEdits() {
    // Enviamos el contenido editado
    const newPosts = [this.post1Content, this.post2Content, this.post3Content];
    this.executeAction('EDIT', newPosts);
  }

  private executeAction(action: 'DISMISS' | 'DELETE' | 'EDIT', posts?: string[]) {
    this.isLoading = true;
    this.adminService.processThreadReport(this.report.id, action, posts).subscribe({
      next: () => {
        let msg = '';
        if (action === 'DISMISS') msg = 'Reporte ignorado.';
        if (action === 'DELETE') msg = 'Hilo eliminado.';
        if (action === 'EDIT') msg = 'Hilo modificado correctamente.';
        
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al procesar la acción.', 'Cerrar');
        this.isLoading = false;
      }
    });
  }
}