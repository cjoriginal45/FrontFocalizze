import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { threadService } from '../../services/thread/thread';
import { ThreadRequest } from '../../interfaces/ThreadRequest';
import { Category } from '../../services/category/category';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { fromEvent, debounceTime, map, distinctUntilChanged, switchMap, of, Observable, startWith, Subject, filter } from 'rxjs';
import { UserSearch } from '../../interfaces/UserSearch';
import { Search } from '../../services/search/search';
import { MatAutocompleteSelectedEvent, MatAutocomplete, MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';

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
    MatDatepicker,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatAutocomplete,
    MatAutocompleteModule
],
  templateUrl: './create-thread-modal.html',
  styleUrl: './create-thread-modal.css',
})
export class CreateThreadModal implements OnInit {
  //threads: string[] = ['', '', ''];
  errorMessage: string | null = null;

  // --- PROPIEDADES NUEVAS PARA LA PROGRAMACIÓN ---
  showScheduler = false;
  scheduledDate: Date | null = null;
  
  // Propiedades para los selectores de hora y minutos
  scheduledHour: number | null = null;
  scheduledMinute: number | null = null;
  
  // Arrays para rellenar los <mat-select>
  hours: number[] = Array.from({ length: 24 }, (_, i) => i); // [0, 1, ..., 23]
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i); // [0, 1, ..., 59]

  threadForm: FormGroup;
  mentionResults$!: Observable<UserSearch[]>;
  private activeTextareaIndex = 0; 

  // Usamos un Subject para tener control explícito sobre la búsqueda
  private mentionQuery$ = new Subject<string | null>();

  // Almacenamos el índice Y la referencia al elemento del textarea activo
  private activeTextarea: { index: number; element: HTMLTextAreaElement | null } = {
    index: 0,
    element: null,
  };

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  private isSelectingMention = false;

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
  selectedCategory: string | null = null;


  constructor(
    public dialogRef: MatDialogRef<CreateThreadModal>,
    private threadService: threadService,
    private categoryService: Category,
    private searchService: Search,
    private fb: FormBuilder
  ){
    // Inicializa el formulario reactivo
    this.threadForm = this.fb.group({
      posts: this.fb.array([
        new FormControl(''),
        new FormControl(''),
        new FormControl(''),
      ]),
    });
  }

  //on init load categories
  ngOnInit(): void {
    this.loadCategories();

    this.mentionResults$ = this.postsArray.valueChanges.pipe(
      // CAMBIO CLAVE 2: Ignoramos cualquier emisión si estamos en proceso de seleccionar una mención.
      // Esto rompe el ciclo que reabría el panel.
      filter(() => !this.isSelectingMention),
      map((posts: string[]) => {
        if (!this.activeTextarea.element) return null;
        const activeText = posts[this.activeTextarea.index] || '';
        return this.extractMentionQuery(activeText, this.activeTextarea.element.selectionStart);
      }),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(query => {
        if (query) {
          return this.searchService.searchUsers(query);
        }
        return of([]);
      })
    );
  }

  get postsArray(): FormArray {
    return this.threadForm.get('posts') as FormArray;
  }
  
  // Función para rastrear qué textarea está activo
  onTextareaFocus(index: number, element: HTMLTextAreaElement): void {
    this.activeTextarea = { index, element };
  }

    // Extrae la consulta de mención (texto después de '@')
    private extractMentionQuery(text: string, cursorPos: number): string | null {
      const textBeforeCursor = text.substring(0, cursorPos);
      const mentionMatch = textBeforeCursor.match(/@(\w+)$/);
      return mentionMatch ? mentionMatch[1] : null; // Devolvemos solo el nombre de usuario, sin la @
    }

  //load categories from API
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (apiCategories) => {
        const mappedCategories = apiCategories.map((cat) => ({
          value: cat.name,
          viewValue: cat.name,
        }));
        this.categories = mappedCategories;
      },
      error: (err) => {
        console.error('Error al cargar las categorías:', err);
        // Si hay un error, simplemente dejamos la lista de categorías vacía.
        // La opción estática "Ninguna" en el HTML seguirá funcionando.
        this.categories = [];
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


    let finalScheduledTime: string | null = null;
    if (this.showScheduler && this.scheduledDate && this.scheduledHour !== null && this.scheduledMinute !== null) {
      const date = new Date(this.scheduledDate);
      date.setHours(this.scheduledHour, this.scheduledMinute, 0, 0);
  
      // --- ¡CAMBIO CLAVE AQUÍ! ---
      // En lugar de toISOString(), construimos el string manualmente
      // para evitar la conversión a UTC.
  
      // Obtenemos los componentes de la fecha en la zona horaria LOCAL.
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses son 0-11
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
  
      // Formato "yyyy-MM-ddTHH:mm:ss" que LocalDateTime parsea directamente.
      finalScheduledTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    // 2. Crear el objeto de datos
    // 2. Create the data object
    const posts = this.postsArray.value;
    const threadData: ThreadRequest = {
      post1: posts[0],
      post2: posts[1],
      post3: posts[2],
      category: this.selectedCategory || 'Ninguna',
      scheduledTime: finalScheduledTime,
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
    if (threadData.post1.trim() === '' 
    || threadData.post2.trim() === '' 
    || threadData.post3.trim() === '') {
      this.errorMessage = 'Los post no pueden estar vacios.';
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

 

  // --- LÓGICA DE DETECCIÓN Y MANEJO DE MENCIONES ---

  

   // Reemplaza la mención parcial con la seleccionada
   onUserMentionSelected(event: MatAutocompleteSelectedEvent): void {
    // CAMBIO CLAVE 3: Activamos el cerrojo al iniciar la selección.
    this.isSelectingMention = true;

    const selectedUser: UserSearch = event.option.value;
    const activeControl = this.postsArray.at(this.activeTextarea.index);
    const textarea = this.activeTextarea.element;

    if (!activeControl || !textarea) {
        this.isSelectingMention = false; // Asegurarse de desactivar el cerrojo si algo falla
        return;
    }

    const currentText = activeControl.value as string;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = currentText.substring(0, cursorPos);

    const newTextBeforeCursor = textBeforeCursor.replace(/@(\w+)$/, `@${selectedUser.username} `);
    const textAfterCursor = currentText.substring(cursorPos);
    
    activeControl.setValue(newTextBeforeCursor + textAfterCursor, { emitEvent: false });
    
    const newCursorPos = newTextBeforeCursor.length;
    
    // Usamos setTimeout para asegurar que todas las actualizaciones del DOM se completen.
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      
      // CAMBIO CLAVE 4: Desactivamos el cerrojo para permitir futuras búsquedas.
      this.isSelectingMention = false;
      this.autocompleteTrigger.closePanel(); // Forzamos el cierre por si acaso.
    }, 0);
  }

  // Función necesaria para MatAutocomplete para que no muestre [Object object]
  displayWithFn = () => '';

}
