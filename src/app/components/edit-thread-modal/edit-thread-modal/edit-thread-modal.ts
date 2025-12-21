import { ChangeDetectionStrategy, Component, DestroyRef, inject, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { Category } from '../../../services/category/category';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface SelectCategory {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-edit-thread-modal',
  standalone: true,
  imports: [
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
  styleUrl: './edit-thread-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditThreadModal {

  // --- Inyección de dependencias moderna ---
  private readonly categoryService = inject(Category);
  private readonly destroyRef = inject(DestroyRef);
  public readonly dialogRef = inject(MatDialogRef<EditThreadModal>);
  public readonly data = inject<{ thread: FeedThreadDto }>(MAT_DIALOG_DATA);

  // --- Estado reactivo con Signals ---
  public readonly threads = signal<string[]>(['', '', '']);
  public readonly selectedCategory = signal<string | null>(null);
  public readonly errorMessage = signal<string | null>(null);
  public readonly currentStep = signal<number>(1);
  public readonly categories = signal<SelectCategory[]>([]);


 // --- Constantes ---
 public readonly charLimits = {
  step1: 280,
  step2: 140,
  step3: 70,
};

  constructor() {
    // Inicialización del estado basada en la data inyectada
    const { thread } = this.data;
    this.threads.set([
      thread.posts[0] || '',
      thread.posts[1] || '',
      thread.posts[2] || ''
    ]);
    this.selectedCategory.set(thread.categoryName || 'Ninguna');
  }
 
 ngOnInit(): void {
   this.loadCategories();
 }

  /**
   * Carga las categorías desde el servicio con gestión de ciclo de vida automática
   */
  private loadCategories(): void {
    this.categoryService.getAllCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (apiCategories) => {
          const mapped = apiCategories.map((cat) => ({
            value: cat.name,
            viewValue: cat.name,
          }));
          this.categories.set(mapped);
        },
        error: (err) => {
          console.error('Error al cargar las categorías:', err);
          this.categories.set([]);
        },
      });
  }
 
  public closeModal(): void {
    this.dialogRef.close();
  }

  /**
   * Actualiza el valor de un post específico en el Signal de threads
   */
  public updateThread(index: number, value: string): void {
    this.threads.update(current => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  }

  public onSave(): void {
    const currentThreads = this.threads();
    
    // Validaciones básicas de integridad
    if (currentThreads[0].trim() === '') {
      this.errorMessage.set('El primer post no puede estar vacío');
      return;
    }

    this.dialogRef.close({
      post1: currentThreads[0],
      post2: currentThreads[1],
      post3: currentThreads[2],
      categoryName: this.selectedCategory()
    });
  }
  
  public nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    }
  }

  public previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }
}
