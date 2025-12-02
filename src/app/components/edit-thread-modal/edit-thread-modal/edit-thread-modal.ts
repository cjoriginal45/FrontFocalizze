import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { Category } from '../../../services/category/category';
import { MatFormField, MatLabel, MatHint, MatFormFieldModule } from "@angular/material/form-field";
import { MatSelect, MatOption, MatSelectModule } from "@angular/material/select";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TranslateModule } from '@ngx-translate/core';

interface SelectCategory {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-edit-thread-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    TextFieldModule,
    TranslateModule
  ],
  templateUrl: './edit-thread-modal.html',
  styleUrl: './edit-thread-modal.css'
})
export class EditThreadModal {
 // Propiedades para el formulario
 threads: string[] = ['', '', ''];
 selectedCategory: string | null = null;
 errorMessage: string | null = null;
 currentStep = 1;

 // Límites de caracteres
 readonly charLimits = {
   step1: 280,
   step2: 140,
   step3: 70,
 };

 // Array para poblar el selector de categorías
 categories: SelectCategory[] = [];

 constructor(
   public dialogRef: MatDialogRef<EditThreadModal>,
   @Inject(MAT_DIALOG_DATA) public data: { thread: FeedThreadDto },
   private categoryService: Category
 ) {
   // Rellenamos el formulario con los datos existentes del hilo que recibimos
   this.threads[0] = data.thread.posts[0] || '';
   this.threads[1] = data.thread.posts[1] || '';
   this.threads[2] = data.thread.posts[2] || '';
   // Si la categoría es nula o vacía, la establecemos en "Ninguna" para el selector
   this.selectedCategory = data.thread.categoryName || 'Ninguna';
 }
 
 ngOnInit(): void {
   this.loadCategories();
 }

 loadCategories(): void {
   this.categoryService.getAllCategories().subscribe({
     next: (apiCategories) => {
       // Mapeamos las categorías al formato {value, viewValue}
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
 
 closeModal(): void {
   this.dialogRef.close();
 }

 // Al guardar, devolvemos los datos actualizados
 onSave(): void {
   // (Puedes añadir aquí las validaciones de caracteres que tienes en CreateThreadModal)

   this.dialogRef.close({
     post1: this.threads[0],
     post2: this.threads[1],
     post3: this.threads[2],
     categoryName: this.selectedCategory
   });
 }

 nextStep(): void {
  if (this.currentStep < 3) {
    this.currentStep++;
  }
}

previousStep(): void {
  if (this.currentStep > 1) {
    this.currentStep--;
  }
}
}
