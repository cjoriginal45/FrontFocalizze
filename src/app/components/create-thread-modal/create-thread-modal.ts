import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { threadService } from '../../services/thread/thread';
import { ThreadRequest } from '../../interfaces/ThreadRequest';
import { Category } from '../../services/category/category';

// Interfaz para el formato que necesita el <mat-select>
// Interface for the format needed by <mat-select>
interface SelectCategory {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-create-thread-modal',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './create-thread-modal.html',
  styleUrl: './create-thread-modal.css',
})
export class CreateThreadModal implements OnInit {
  threads: string[] = ['', '', ''];
  errorMessage: string | null = null;

  //limite de caracteres por paso
  //character limit per step
  readonly charLimits = {
    step1: 280,
    step2: 140,
    step3: 70,
  };

  // Lógica para el flujo multi-paso en móvil
  // Logic for multi-step flow on mobile
  currentStep = 1;

  //categories logic
  categories: SelectCategory[] = [];
  selectedCategory: string = 'Ninguna';

  constructor(
    public dialogRef: MatDialogRef<CreateThreadModal>,
    private threadService: threadService,
    private categoryService: Category
  ) {}

  //on init load categories
  ngOnInit(): void {
    this.loadCategories();
  }

  //load categories from API
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (apiCategories) => {
        // 1. Mapeamos las categorías de la API al formato que necesita nuestro <mat-select>
        // 1. We map the API categories to the format needed by our <mat-select>
        const mappedCategories = apiCategories.map((cat) => ({
          value: cat.name,
          viewValue: cat.name,
        }));

        this.categories = [...mappedCategories];
      },
      error: (err) => {
        console.error('Error al cargar las categorías', err);
        // En caso de error, al menos mostramos la opción por defecto
        // In case of error, at least show the default option
        this.categories = [{ value: 'Ninguna', viewValue: 'Ninguna' }];
      },
    });
  }

  //modal logic

  closeModal(): void {
    this.dialogRef.close();
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

  //publish logic with character validation
  publish(): void {
    // 1. Reiniciar cualquier mensaje de error anterior
    // 1. Reset any previous error message
    this.errorMessage = null;

    // 2. Crear el objeto de datos
    // 2. Create the data object
    const threadData: ThreadRequest = {
      post1: this.threads[0],
      post2: this.threads[1],
      post3: this.threads[2],
      category: this.selectedCategory,
    };

    // 3. Validar los límites de caracteres
    // 3. Validate character limits
    if (threadData.post1.length > this.charLimits.step1) {
      this.errorMessage = `El primer hilo excede el límite de ${this.charLimits.step1} caracteres.`;
      return;
    }
    if (threadData.post2.length > this.charLimits.step2) {
      this.errorMessage = `El segundo hilo excede el límite de ${this.charLimits.step2} caracteres.`;
      return;
    }
    if (threadData.post3.length > this.charLimits.step3) {
      this.errorMessage = `El tercer hilo excede el límite de ${this.charLimits.step3} caracteres.`;
      return;
    }
    if (threadData.post1.trim() === '') {
      this.errorMessage = 'El primer hilo no puede estar vacío.';
      return;
    }

    // 4. Si todas las validaciones pasan, se llama al servicio
    // 4. If all validations pass, call the service
    this.threadService.createThread(threadData).subscribe({
      next: (response) => {
        console.log('Hilo creado con éxito!', response);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al crear el hilo:', err);
        this.errorMessage = 'Ocurrió un error al publicar el hilo. Inténtalo de nuevo.';
      },
    });
  }
}
