import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators';
import { UserSearch } from '../../interfaces/UserSearch';
import { Search } from '../../services/search/search';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ThreadState } from '../../services/thread-state/thread-state';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

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
  private threadState = inject(ThreadState);

  errorMessage: string | null = null;
  showScheduler = false;
  scheduledDate: Date | null = null;
  scheduledHour: number | null = null;
  scheduledMinute: number | null = null;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);

  threads: string[] = ['', '', ''];
  categories: SelectCategory[] = [];
  selectedCategory: string | null = null;
  currentStep = 1;
  readonly charLimits = { step1: 600, step2: 400, step3: 300 };

  // --- AUTOCOMPLETE LÓGICA ---
  mentionResults$!: Observable<UserSearch[]>;
  private mentionQuery$ = new Subject<string | null>();

  // Solo necesitamos saber cuál input se tocó por última vez para las menciones
  private lastFocusedIndex: number = 0;
  private lastCursorPosition: number = 0;

  private lastTextContent: string = '';

  isMobileView = true;
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

  ngOnInit(): void {
    this.loadCategories();
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => {
        this.isMobileView = result.matches;
        this.triggerResize();
      });

    // Configuración reactiva del buscador
    this.mentionResults$ = this.mentionQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query && query.length >= 1) {
          // Buscar a partir de 1 letra después del @
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

  // --- MANEJO DE EVENTOS TEXTAREA ---
  // --- 1. RASTREO DEL CURSOR (Se ejecuta al escribir/clicar) ---
  // --- 1. RASTREO ROBUSTO DEL CURSOR ---
  onTextareaEvent(event: Event, index: number): void {
    const textarea = event.target as HTMLTextAreaElement;

    this.lastFocusedIndex = index;
    this.lastCursorPosition = textarea.selectionStart;
    this.lastTextContent = textarea.value; // <--- GUARDAMOS EL TEXTO AQUÍ

    // Lógica de detección de @
    const textBeforeCursor = textarea.value.substring(0, this.lastCursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);

    this.mentionQuery$.next(mentionMatch ? mentionMatch[1] : null);
  }

  // --- 2. SELECCIÓN DE MENCIÓN CORREGIDA ---
  onUserMentionSelected(event: MatAutocompleteSelectedEvent): void {
    // Evitamos que el evento por defecto propague valores incorrectos
    event.option.deselect();

    const selectedUser = event.option.value;
    const index = this.lastFocusedIndex;

    // Obtenemos el elemento nativo
    const textareaRef = this.threadInputs.toArray()[index];
    if (!textareaRef) return;
    const textarea = textareaRef.nativeElement;

    // USAMOS LAS VARIABLES GUARDADAS (Snapshot del momento antes de perder el foco)
    const cursor = this.lastCursorPosition;
    const currentText = this.lastTextContent; // Usamos el texto que guardamos en 'input'

    // Buscamos el @ hacia atrás desde la posición del cursor guardada
    const textBeforeCursor = currentText.substring(0, cursor);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      // Texto previo al @
      const prefix = currentText.substring(0, atIndex);
      // Texto posterior al cursor (lo que había después de lo que estabas escribiendo)
      const suffix = currentText.substring(cursor);

      // Construimos el nuevo texto
      const newText = `${prefix}@${selectedUser.username} ${suffix}`;

      // 1. Actualizamos el modelo de Angular
      this.threads[index] = newText;

      // 2. Forzamos la actualización visual del DOM (para contrarrestar a Material)
      textarea.value = newText;

      // 3. Avisamos a Angular que hubo un cambio "input"
      textarea.dispatchEvent(new Event('input'));

      // 4. Calculamos dónde debe quedar el cursor (después del espacio)
      const newCursorPos = atIndex + selectedUser.username.length + 2; // +2 por '@' y ' '

      // 5. Devolvemos el foco y el cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);

        // Actualizamos el tracker para que no quede desfasado
        this.lastCursorPosition = newCursorPos;
        this.lastTextContent = newText;
      }, 0);
    }
  }

  // --- LÓGICA DE EMOJIS ---
  addEmoji(event: any, index: number, textarea: HTMLTextAreaElement): void {
    const emoji = event.emoji.native;
    textarea.setRangeText(emoji, textarea.selectionStart, textarea.selectionEnd, 'end');
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();
  }

  // Helper para mostrar string vacío en el input mientras se selecciona (Angular Material quirk)
  displayWithFn(user: UserSearch): string {
    return '';
  }

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

  triggerResize(): void {
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.cdkTextareas?.forEach((textarea) => textarea.resizeToFitContent(true));
    });
  }

  publish(): void {
    this.errorMessage = null;
    let finalScheduledTime: string | null = null;

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

    if (threadData.post1.trim() === '') {
      this.errorMessage = 'Los post no pueden estar vacios.';
      return;
    }

    if (
      threadData.post1.length > this.charLimits.step1 ||
      threadData.post2.length > this.charLimits.step2 ||
      threadData.post3.length > this.charLimits.step3
    ) {
      this.errorMessage = `Un post excede el límite de caracteres.`;
      return;
    }

    this.threadService.createThread(threadData).subscribe({
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
}
