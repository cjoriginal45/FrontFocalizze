import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

// Esta interfaz define la forma de los datos que nuestro modal espera recibir
// This interface defines the form of data our modal expects to receive
export interface DialogData {
  postId: string;
}

@Component({
  selector: 'app-comments',
  imports: [
    MatIcon,
    MatDialogContent,
    MatFormField,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    CdkTextareaAutosize,
  ],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments {
  // Inyectamos la referencia al propio diálogo para poder cerrarlo
  // We inject the reference to the dialog itself to be able to close it
  public dialogRef = inject(MatDialogRef<Comments>);
  // Inyectamos los datos que nos pasaron al abrir el diálogo (el postId)
  // We inject the data that was passed to us when opening the dialog (the postId)
  public data: DialogData = inject(MAT_DIALOG_DATA);

  // En una aplicación real, usarías this.data.postId para llamar a un servicio
  // y obtener los comentarios de la base de datos. Por ahora, usamos datos de ejemplo.
  // In a real-world application, you would use this.data.postId to call a service
  // and retrieve the comments from the database. For now, let's use sample data.
  comments = [
    {
      author: 'Elena Gómez',
      handle: '@elena',
      avatarUrl: '',
      content: '¡Totalmente de acuerdo! Angular Material simplifica mucho las cosas.',
      date: 'hace 5m',
    },
    {
      author: 'Carlos Ruiz',
      handle: '@carlos',
      avatarUrl: '',
      content: 'Buen punto. Yo añadiría también la importancia de los observables con RxJS.',
      date: 'hace 2h',
    },
    {
      author: 'Ana García',
      handle: '@anagarcia',
      avatarUrl: '',
      content: 'Excelente explicación, me ha servido de mucho para mi proyecto.',
      date: 'hace 1 día',
    },
  ];

  constructor() {
    // Verificar que recibo el ID del post correcto
    // Verify that I receive the correct post ID
    console.log('Mostrando comentarios para el post ID:', this.data.postId);
  }

  // Cierra el diálogo cuando el usuario hace clic en el botón de cerrar
  // Closes the dialog when the user clicks the close button
  onClose(): void {
    this.dialogRef.close();
  }
}
