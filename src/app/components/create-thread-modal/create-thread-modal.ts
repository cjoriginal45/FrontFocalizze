import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
    MatInputModule
  ],
  templateUrl: './create-thread-modal.html',
  styleUrl: './create-thread-modal.css'
})
export class CreateThreadModal {
// Datos del formulario
threads: string[] = ['', '', ''];
selectedCategory: string = '-'; // Valor por defecto

readonly charLimits = {
  step1: 280,
  step2: 140,
  step3: 70
};

// Lógica para el flujo multi-paso en móvil
currentStep = 1;

// Datos de ejemplo para las categorías
categories = [
  { value: '-', viewValue: 'Sin Categoría' },
  { value: 'dev', viewValue: 'Desarrollo Web' },
  { value: 'design', viewValue: 'Diseño UX/UI' },
  { value: 'startups', viewValue: 'Startups' }
];

constructor(
  public dialogRef: MatDialogRef<CreateThreadModal>
) {}

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

publish(): void {
  // Aquí iría la lógica para enviar los datos al backend
  const threadData = {
    threads: this.threads.filter(t => t.trim() !== ''), // Filtra hilos vacíos
    category: this.selectedCategory
  };
  console.log('Publicando hilo:', threadData);
  this.closeModal(); // Cierra la modal después de publicar
}

getCurrentCharLimit(): number {
  switch(this.currentStep) {
    case 1: return this.charLimits.step1;
    case 2: return this.charLimits.step2;
    case 3: return this.charLimits.step3;
    default: return 0;
  }
}

}
