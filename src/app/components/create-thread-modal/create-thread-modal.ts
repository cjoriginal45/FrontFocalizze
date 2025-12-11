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

  private isEmojiPickerOpen = false;

  threads: string[] = ['', '', ''];
  categories: SelectCategory[] = [];
  selectedCategory: string | null = null;
  currentStep = 1;
  readonly charLimits = { step1: 600, step2: 400, step3: 300 };

  mentionResults$!: Observable<UserSearch[]>;
  private mentionQuery$ = new Subject<string | null>();

  // --- VARIABLES PARA EL TRACKING ---
  private lastFocusedIndex: number = 0;
  private lastCursorPosition: number = 0;

  isMobileView = true;
  private breakpointSubscription!: Subscription;

  @ViewChildren(CdkTextareaAutosize) cdkTextareas!: QueryList<CdkTextareaAutosize>;

  // Referencia a los elementos del DOM
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
    this.mentionResults$ = this.mentionQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => (query ? this.searchService.searchUsers(query) : of([])))
    );
  }

  ngAfterViewInit(): void {
    this.triggerResize();
    // LOG 1: Verificar si Angular encontró los textareas
    console.log('[Init] Textareas encontrados:', this.threadInputs?.length);
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  // --- MÉTODO DE RASTREO DEL CURSOR ---
  trackCursor(event: Event, index: number): void {
    // Si el selector de emojis está abierto, NO actualizamos la posición del cursor
    // para evitar que se resetee a 0 al perder el foco.
    if (this.isEmojiPickerOpen) return;

    const textarea = event.target as HTMLTextAreaElement;
    this.lastFocusedIndex = index;
    this.lastCursorPosition = textarea.selectionStart;

    // LOG 2: Verificar qué se está guardando mientras escribes o haces click
    console.log(
      `[Track] Index: ${index} | Cursor Pos: ${this.lastCursorPosition} | Texto actual: "${textarea.value}"`
    );

    // Lógica de menciones
    const textBeforeCursor = textarea.value.substring(0, this.lastCursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);
    this.mentionQuery$.next(mentionMatch ? mentionMatch[1] : null);
  }

  // MÉTODO PARA ABRIR EMOJIS (Llamado desde el botón)
  openEmojiPicker() {
    this.isEmojiPickerOpen = true;
    console.log('Picker abierto, trackCursor pausado.');
  }

  // MÉTODO PARA CERRAR (Llamado al cerrar el menú)
  onEmojiMenuClosed() {
    this.isEmojiPickerOpen = false;
  }

  // --- LÓGICA DE EMOJIS ---
  addEmoji(event: any, index: number, textarea: HTMLTextAreaElement): void {
    const emoji = event.emoji.native;

    // 1. Usar la API nativa para insertar texto donde esté el cursor (o reemplazar selección)
    // 'end' pone el cursor justo después del emoji insertado
    // Si el textarea perdió el foco, el navegador recuerda internamente la última selección
    textarea.setRangeText(emoji, textarea.selectionStart, textarea.selectionEnd, 'end');

    // 2. CRÍTICO: Avisar a Angular que el valor cambió
    // Sin esto, ngModel no se entera del cambio hecho por setRangeText
    textarea.dispatchEvent(new Event('input'));

    // 3. Devolver el foco al textarea para seguir escribiendo
    textarea.focus();
  }

  // ... (Resto de métodos sin cambios: onUserMentionSelected, etc) ...

  onUserMentionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value;
    const index = this.lastFocusedIndex;
    const cursor = this.lastCursorPosition;

    const currentText = this.threads[index] || '';
    const textBefore = currentText.substring(0, cursor);
    const textAfter = currentText.substring(cursor);

    const newTextBefore = textBefore.replace(/@(\w+)$/, `@${selectedUser.username} `);
    this.threads[index] = newTextBefore + textAfter;

    this.lastCursorPosition = newTextBefore.length;

    setTimeout(() => {
      const textareaArray = this.threadInputs.toArray();
      if (textareaArray[index]) {
        const el = textareaArray[index].nativeElement;
        el.focus();
        el.setSelectionRange(this.lastCursorPosition, this.lastCursorPosition);
      }
    }, 0);
  }

  displayWithFn = () => '';
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
    // ... lógica de fecha ...
    const threadData: ThreadRequest = {
      post1: this.threads[0],
      post2: this.threads[1],
      post3: this.threads[2],
      category: this.selectedCategory || 'Ninguna',
      scheduledTime: null,
    };
    // ... validaciones ...
    if (threadData.post1.trim() === '') {
      this.errorMessage = 'Vacio';
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
            followersCount: 0,
            followingCount: 0,
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
      error: (err) => console.error(err),
    });
  }
}
