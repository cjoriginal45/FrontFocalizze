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

  mentionResults$!: Observable<UserSearch[]>;
  private mentionQuery$ = new Subject<string | null>();

  // Solo necesitamos saber cuál input se tocó por última vez para las menciones
  private lastFocusedIndex: number = 0;

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
    this.mentionResults$ = this.mentionQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => (query ? this.searchService.searchUsers(query) : of([])))
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
  onTextareaEvent(event: Event, index: number): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.lastFocusedIndex = index; // Guardamos índice para saber dónde insertar la mención

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);

    this.mentionQuery$.next(mentionMatch ? mentionMatch[1] : null);
  }

  // --- LÓGICA DE EMOJIS (API Nativa) ---
  addEmoji(event: any, index: number, textarea: HTMLTextAreaElement): void {
    const emoji = event.emoji.native;

    // 1. Insertar emoji en la posición del cursor (o reemplazar selección)
    textarea.setRangeText(emoji, textarea.selectionStart, textarea.selectionEnd, 'end');

    // 2. Notificar a Angular que el valor cambió (para actualizar ngModel)
    textarea.dispatchEvent(new Event('input'));

    // 3. Devolver foco
    textarea.focus();
  }

  // --- LÓGICA DE MENCIONES (Optimizada) ---
  onUserMentionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value;
    const index = this.lastFocusedIndex;

    // Obtenemos referencia directa al elemento para evitar desincronización
    const textareaRef = this.threadInputs.toArray()[index];
    if (!textareaRef) return;
    const textarea = textareaRef.nativeElement;

    const cursor = textarea.selectionStart;
    const currentText = textarea.value; // Leemos valor real del DOM

    // Buscamos dónde empieza el '@' antes del cursor
    const textBefore = currentText.substring(0, cursor);
    const lastAtPos = textBefore.lastIndexOf('@');

    if (lastAtPos !== -1) {
      // Reemplazar desde el '@' hasta el cursor con la mención completa
      textarea.setRangeText(`@${selectedUser.username} `, lastAtPos, cursor, 'end');

      // Notificar a Angular
      textarea.dispatchEvent(new Event('input'));

      // Devolver foco
      textarea.focus();
    }
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

    if (
      this.showScheduler &&
      this.scheduledDate &&
      this.scheduledHour !== null &&
      this.scheduledMinute !== null
    ) {
      const date = new Date(this.scheduledDate);
      date.setHours(this.scheduledHour, this.scheduledMinute, 0, 0);
      // Construcción manual de fecha ISO local
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
