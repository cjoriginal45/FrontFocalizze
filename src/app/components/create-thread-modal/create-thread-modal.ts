import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// --- ANGULAR MATERIAL IMPORTS ---
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';

// --- CDK & THIRD PARTY ---
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TranslateModule } from '@ngx-translate/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

// --- RXJS ---
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators';

// --- SERVICES & INTERFACES ---
import { threadService } from '../../services/thread/thread';
import { ThreadRequest } from '../../interfaces/ThreadRequest';
import { Category } from '../../services/category/category';
import { UserSearch } from '../../interfaces/UserSearch';
import { Search } from '../../services/search/search';
import { ThreadState } from '../../services/thread-state/thread-state';
import { FeedThreadDto } from '../../interfaces/FeedThread';

interface SelectCategory {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-create-thread-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    TranslateModule,
    PickerComponent,
    MatMenuModule,
  ],
  templateUrl: './create-thread-modal.html',
  styleUrl: './create-thread-modal.css',
})
export class CreateThreadModal implements OnInit, OnDestroy {
  // --- INYECCIÓN DE SERVICIOS ---
  private threadState = inject(ThreadState);

  // --- PROPIEDADES DE ESTADO Y UI ---
  errorMessage: string | null = null;
  currentStep = 1;
  isMobileView = true;
  readonly charLimits = { step1: 600, step2: 400, step3: 300 };
  
  // --- HILOS Y CATEGORÍAS ---
  threads: string[] = ['', '', ''];
  categories: SelectCategory[] = [];
  selectedCategory: string | null = null;

  // --- PROGRAMADOR (SCHEDULER) ---
  showScheduler = false;
  scheduledDate: Date | null = null;
  scheduledHour: number | null = null;
  scheduledMinute: number | null = null;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);

  // --- IMÁGENES ---
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  readonly MAX_IMAGES = 4;
  readonly MAX_SIZE_MB = 5;

  // --- MENCIONES Y BÚSQUEDA ---
  mentionResults$!: Observable<UserSearch[]>;
  private mentionQuery$ = new Subject<string | null>();
  private lastFocusedIndex: number = 0;
  private lastCursorPosition: number = 0;
  private lastTextContent: string = '';

  // --- SUBSCRIPCIONES Y VIEWCHILDREN ---
  private breakpointSubscription!: Subscription;
  @ViewChildren(CdkTextareaAutosize) cdkTextareas!: QueryList<CdkTextareaAutosize>;
  @ViewChildren('threadInput') threadInputs!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    public dialogRef: MatDialogRef<CreateThreadModal>,
    private threadService: threadService,
    private categoryService: Category,
    private searchService: Search,
    private breakpointObserver: BreakpointObserver,
    private _ngZone: NgZone
  ) {}

  // --- CICLO DE VIDA ---

  ngOnInit(): void {
    this.loadCategories();
    
    // Observador para diseño responsivo
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => {
        this.isMobileView = result.matches;
        this.triggerResize();
      });

    // Configuración reactiva del buscador de menciones
    this.mentionResults$ = this.mentionQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query && query.length >= 1) {
          return this.searchService.searchUsers(query);
        }
        return of([]);
      })
    );
  }

  ngAfterViewInit(): void {
    this.triggerResize();
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  // --- MANEJO DE TEXTAREA Y EVENTOS ---

  /** Rastrea la posición del cursor y detecta si se está escribiendo una mención (@) */
  onTextareaEvent(event: Event, index: number): void {
    const textarea = event.target as HTMLTextAreaElement;

    this.lastFocusedIndex = index;
    this.lastCursorPosition = textarea.selectionStart;
    this.lastTextContent = textarea.value;

    const textBeforeCursor = textarea.value.substring(0, this.lastCursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);

    this.mentionQuery$.next(mentionMatch ? mentionMatch[1] : null);
  }

  /** Inserta el usuario seleccionado en el textarea correspondiente */
  onUserMentionSelected(event: MatAutocompleteSelectedEvent): void {
    event.option.deselect();

    const selectedUser = event.option.value;
    const index = this.lastFocusedIndex;
    const textareaRef = this.threadInputs.toArray()[index];
    
    if (!textareaRef) return;
    const textarea = textareaRef.nativeElement;

    const cursor = this.lastCursorPosition;
    const currentText = this.lastTextContent;

    const textBeforeCursor = currentText.substring(0, cursor);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const prefix = currentText.substring(0, atIndex);
      const suffix = currentText.substring(cursor);
      const newText = `${prefix}@${selectedUser.username} ${suffix}`;

      this.threads[index] = newText;
      textarea.value = newText;
      textarea.dispatchEvent(new Event('input'));

      const newCursorPos = atIndex + selectedUser.username.length + 2;

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        this.lastCursorPosition = newCursorPos;
        this.lastTextContent = newText;
      }, 0);
    }
  }

  /** Inserta un emoji en la posición actual del cursor */
  addEmoji(event: any, index: number, textarea: HTMLTextAreaElement): void {
    const emoji = event.emoji.native;
    textarea.setRangeText(emoji, textarea.selectionStart, textarea.selectionEnd, 'end');
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();
  }

  /** Muestra string vacío en el input de Autocomplete durante la selección */
  displayWithFn(user: UserSearch): string {
    return '';
  }

  // --- NAVEGACIÓN Y UTILIDADES DE UI ---

  loadCategories(): void {
    this.categoryService
      .getAllCategories()
      .subscribe(
        (next) => (this.categories = next.map((c) => ({ value: c.name, viewValue: c.name })))
      );
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
      this.triggerResize();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.triggerResize();
    }
  }

  /** Ajusta el tamaño de los textareas para que encajen con el contenido */
  triggerResize(): void {
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.cdkTextareas?.forEach((textarea) => textarea.resizeToFitContent(true));
    });
  }

  // --- LÓGICA DE PUBLICACIÓN ---

  publish(): void {
    this.errorMessage = null;
    let finalScheduledTime: string | null = null;

    // Procesamiento de fecha programada
    if (
      this.showScheduler &&
      this.scheduledDate &&
      this.scheduledHour !== null &&
      this.scheduledMinute !== null
    ) {
      const date = new Date(this.scheduledDate);
      date.setHours(this.scheduledHour, this.scheduledMinute, 0, 0);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      finalScheduledTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    const threadData: ThreadRequest = {
      post1: this.threads[0],
      post2: this.threads[1],
      post3: this.threads[2],
      category: this.selectedCategory || 'Ninguna',
      scheduledTime: finalScheduledTime,
    };

   // 1. Validar si todo está totalmente vacío (ni texto ni imágenes)
  if (threadData.post1.trim() === '' && this.selectedImages.length === 0) {
    this.errorMessage = 'Debes escribir algo o subir una imagen.';
    return;
  }

  // 2. Validar límites de caracteres (solo si hay texto)
  if (
    threadData.post1.length > this.charLimits.step1 ||
    threadData.post2.length > this.charLimits.step2 ||
    threadData.post3.length > this.charLimits.step3
  ) {
    this.errorMessage = `Un post excede el límite de caracteres.`;
    return;
  }

    // Petición al servicio
    this.threadService.createThread(threadData, this.selectedImages).subscribe({
      next: (responseDto) => {
        const newFeedThread: FeedThreadDto = {
          id: responseDto.id,
          user: {
            id: responseDto.author!.id,
            username: responseDto.author!.username,
            displayName: responseDto.author!.displayName,
            avatarUrl: responseDto.author!.avatarUrl || 'assets/images/default-avatar.png',
            isFollowing: false,
            followersCount: responseDto.author!.followersCount || 0,
            followingCount: responseDto.author!.followingCount || 0,
          },
          publicationDate: responseDto.createdAt,
          posts: responseDto.posts,
          stats: responseDto.stats,
          isLiked: false,
          isSaved: false,
          categoryName: responseDto.categoryName || 'Ninguna',
          images: responseDto.images || [],
        };
        this.threadState.notifyThreadCreated(newFeedThread);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al crear el hilo:', err);
        if (err.error && err.error.message && err.error.message.includes('Límite diario')) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Ocurrió un error al publicar el hilo.';
        }
      },
    });
  }

  // --- LÓGICA DE IMÁGENES ---

  /** Procesa la selección de archivos e imágenes */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    if (this.selectedImages.length + files.length > this.MAX_IMAGES) {
      this.errorMessage = `Máximo ${this.MAX_IMAGES} imágenes permitidas.`;
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Solo se permiten archivos de imagen.';
        continue;
      }
      if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
        this.errorMessage = `La imagen ${file.name} excede el tamaño máximo de ${this.MAX_SIZE_MB}MB.`;
        continue;
      }

      this.selectedImages.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
    this.errorMessage = null;
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }
}