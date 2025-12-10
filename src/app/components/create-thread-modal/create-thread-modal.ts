import { CommonModule } from '@angular/common';
import {
  Component,
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
  private activeTextarea: HTMLTextAreaElement | null = null;

  isMobileView = true;
  private breakpointSubscription!: Subscription;

  @ViewChildren(CdkTextareaAutosize) cdkTextareas!: QueryList<CdkTextareaAutosize>;

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

  onTextareaEvent(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.activeTextarea = textarea;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);
    this.mentionQuery$.next(mentionMatch ? mentionMatch[1] : null);
  }

  onUserMentionSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.activeTextarea) return;
    const selectedUser: UserSearch = event.option.value;
    const textarea = this.activeTextarea;
    const [text, cursorPos] = [textarea.value, textarea.selectionStart];
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);
    const newTextBefore = textBeforeCursor.replace(/@(\w+)$/, `@${selectedUser.username} `);
    const newFullText = newTextBefore + textAfterCursor;
    const index = parseInt(textarea.dataset['index'] || '', 10);
    if (!isNaN(index)) {
      this.threads[index] = newFullText;
    }
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = newTextBefore.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  displayWithFn = () => '';

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (apiCategories) => {
        this.categories = apiCategories.map((cat) => ({ value: cat.name, viewValue: cat.name }));
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
      const year = date.getFullYear(),
        month = (date.getMonth() + 1).toString().padStart(2, '0'),
        day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0'),
        minutes = date.getMinutes().toString().padStart(2, '0'),
        seconds = date.getSeconds().toString().padStart(2, '0');
      finalScheduledTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    const threadData: ThreadRequest = {
      post1: this.threads[0],
      post2: this.threads[1],
      post3: this.threads[2],
      category: this.selectedCategory || 'Ninguna',
      scheduledTime: finalScheduledTime || undefined,
    };
    if (
      threadData.post1.length > this.charLimits.step1 ||
      threadData.post2.length > this.charLimits.step2 ||
      threadData.post3.length > this.charLimits.step3
    ) {
      this.errorMessage = `Un post excede el límite de caracteres.`;
      return;
    }
    if (
      threadData.post1.trim() === '' ||
      threadData.post2.trim() === '' ||
      threadData.post3.trim() === ''
    ) {
      this.errorMessage = 'Los post no pueden estar vacios.';
      return;
    }

    this.threadService.createThread(threadData).subscribe({
      next: (responseDto: ThreadResponse) => {
        // --- CONVERTIR ThreadResponse a FeedThreadDto ---
        // Esto es necesario porque el store usa FeedThreadDto para renderizar.
        // Hacemos una conversión manual con los datos que tenemos.
        const newFeedThread: FeedThreadDto = {
          id: responseDto.id,
          user: {
            id: responseDto.author!.id,
            username: responseDto.author!.username,
            displayName: responseDto.author!.displayName,
            avatarUrl: responseDto.author!.avatarUrl || 'assets/images/default-avatar.png',
            isFollowing: false, // Es mi propio hilo
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

        // --- NOTIFICAR AL ESTADO GLOBAL ---
        // Esto disparará threadCreated$ en ThreadState, y Feed.ts lo escuchará
        // para agregarlo arriba de todo sin F5.
        this.threadState.notifyThreadCreated(newFeedThread);

        this.closeModal();
      },
      error: (err) => {
        console.error('Error al crear el hilo:', err);
        // Si el error es por límite diario, mostramos mensaje amigable
        if (err.error && err.error.message && err.error.message.includes('Límite diario')) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Ocurrió un error al publicar el hilo. Inténtalo de nuevo.';
        }
      },
    });
  }
}
