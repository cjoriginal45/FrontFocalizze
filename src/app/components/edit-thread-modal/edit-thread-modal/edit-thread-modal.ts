import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { Category } from '../../../services/category/category';
import { MatFormField, MatLabel, MatHint } from "@angular/material/form-field";
import { MatSelect, MatOption } from "@angular/material/select";
import { MatIcon } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';
import { CategoryInterface } from '../../../interfaces/CategoryInterface';

@Component({
  selector: 'app-edit-thread-modal',
  imports: [MatFormField, MatLabel, MatHint, MatSelect, MatOption, MatIcon, FormsModule],
  templateUrl: './edit-thread-modal.html',
  styleUrl: './edit-thread-modal.css'
})
export class EditThreadModal {
// Los datos se inicializan con la información del hilo que estamos editando

categories: CategoryInterface[] = [];

threads: string[] = ['', '', ''];
selectedCategory: string | null = null;
errorMessage: string | null = null; // Útil para validaciones futuras

  // Copiamos los límites de caracteres desde la modal de creación.
  readonly charLimits = {
    step1: 280,
    step2: 140,
    step3: 70,
  };



constructor(
  public dialogRef: MatDialogRef<EditThreadModal>,
  @Inject(MAT_DIALOG_DATA) public data: { thread: FeedThreadDto }, // Recibe el hilo completo
  private categoryService: Category
) {
  // Rellenamos el formulario con los datos existentes del hilo
  this.threads[0] = data.thread.posts[0] || '';
  this.threads[1] = data.thread.posts[1] || '';
  this.threads[2] = data.thread.posts[2] || '';
  this.selectedCategory = data.thread.categoryName || null;
}

ngOnInit(): void {
  this.categoryService.getAllCategories(); // Carga las categorías igual que en la modal de creación
}

// El método loadCategories() es idéntico al de CreateThreadModal

closeModal(): void {
  this.dialogRef.close();
}

// Al guardar, devolvemos los datos actualizados
onSave(): void {
  // ... (puedes añadir validaciones de caracteres aquí si quieres) ...
  
  this.dialogRef.close({
    post1: this.threads[0],
    post2: this.threads[1],
    post3: this.threads[2],
    categoryName: this.selectedCategory
  });
}

loadCategories(): void {
  this.categoryService.getAllCategories().subscribe({
    next: (apiCategories) => {
      this.categories = apiCategories.map((cat) => ({
        value: cat.name,
        viewValue: cat.name,
      }));
    },
    error: (err) => {
      console.error('Error al cargar las categorías:', err);
      this.categories = [];
    },
  });
}
}
