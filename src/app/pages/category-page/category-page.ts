import { Component, computed, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs';

import { Header } from '../../components/header/header';
import { Thread } from '../../components/thread/thread';
import { Comments } from '../../components/comments/comments';
import { FollowButton } from '../../components/follow-button/follow-button/follow-button';
import { Category } from '../../services/category/category';
import { ThreadState } from '../../services/thread-state/thread-state';
import { CategoryState } from '../../services/category-state/category-state';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { CategoryDetailsInterface } from '../../interfaces/CategoryDetailsInterface';
import { CategoryInterface } from '../../interfaces/CategoryInterface';
import { UserState } from '../../services/user-state/user-state';
import { BottonNav } from '../../components/botton-nav/botton-nav';

interface CategoryPageState {
  category: CategoryDetailsInterface | null;
  threadIds: number[];
  isLoading: boolean;
  allThreadsLoaded: boolean;
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    Header,
    Thread,
    FollowButton,
    BottonNav,
  ],
  templateUrl: './category-page.html',
  styleUrl: './category-page.css',
})
export class CategoryPage implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(Category);
  private threadStateService = inject(ThreadState);
  private categoryStateService = inject(CategoryState);
  private dialog = inject(MatDialog);
  private userStateService = inject(UserState);

  private state = signal<CategoryPageState>({
    category: null,
    threadIds: [],
    isLoading: true,
    allThreadsLoaded: false,
  });

  public category = computed(() => this.state().category);
  public threadIds = computed(() => this.state().threadIds);
  public isLoading = computed(() => this.state().isLoading);

  private currentPage = 0;
  private readonly pageSize = 10;

  ngOnInit(): void {
    console.log('[CategoryPage] ngOnInit: Iniciando componente.');

    this.route.paramMap
      .pipe(
        tap(() => {
          console.log('[CategoryPage] 1. (tap) Reseteando estado...');
          this.state.set({
            category: null,
            threadIds: [],
            isLoading: true,
            allThreadsLoaded: false,
          });
          this.currentPage = 0;
        }),
        switchMap((params) => {
          const categoryName = params.get('name');
          console.log(
            `[CategoryPage] 2. (switchMap) Obtenido nombre de categoría: '${categoryName}'`
          );
          if (!categoryName) throw new Error('Nombre de categoría no encontrado');

          console.log('[CategoryPage] 3. (switchMap) Llamando a getCategoryDetails...');
          return this.categoryService.getCategoryDetails(categoryName);
        }),
        switchMap((categoryDetails) => {
          console.log(
            '[CategoryPage] 4. (switchMap) Detalles de categoría RECIBIDOS:',
            categoryDetails
          );
          this.state.update((s) => ({ ...s, category: categoryDetails }));

          const categoryForState: CategoryInterface = {
            id: categoryDetails.id,
            name: categoryDetails.name,
            description: categoryDetails.description,
            followerCount: categoryDetails.followersCount,
            isFollowedByCurrentUser: categoryDetails.isFollowing,
          };
          this.categoryStateService.loadCategories([categoryForState]);
          console.log('[CategoryPage] 5. (switchMap) Categoría cargada en CategoryState.');

          console.log('[CategoryPage] 6. (switchMap) Llamando a getThreadsForCategory...');
          return this.categoryService.getThreadsForCategory(
            categoryDetails.name,
            this.currentPage,
            this.pageSize
          );
        })
      )
      .subscribe({
        next: (threadPage) => {
          console.log('[CategoryPage] 7. (subscribe) Página de hilos RECIBIDA:', threadPage);
          const newThreads: FeedThreadDto[] = threadPage.content;

          // --- SOLUCIÓN AL ERROR ---
          // 1. Extraemos los datos de los usuarios de los hilos que acabamos de recibir.
          const usersFromThreads = newThreads.map((t) => t.user);
          // 2. Cargamos esos usuarios en el UserState.
          //    Ahora, cuando se creen los FollowButton, encontrarán el estado.
          this.userStateService.loadUsers(usersFromThreads);
          // --- FIN DE LA SOLUCIÓN ---

          this.threadStateService.loadThreads(newThreads);
          console.log('[CategoryPage] 8. (subscribe) Hilos cargados en ThreadState.');

          this.state.update((s) => ({
            ...s,
            threadIds: newThreads.map((t) => t.id),
            isLoading: false,
            allThreadsLoaded: threadPage.last,
          }));
          console.log(
            '[CategoryPage] 9. (subscribe) Estado final actualizado. threadIds:',
            this.state().threadIds
          );
        },
        error: (err) => {
          console.error('[CategoryPage] ¡ERROR en el flujo de carga!', err);
          this.state.update((s) => ({ ...s, isLoading: false }));
        },
      });
  }

  onFollowChange(isNowFollowing: boolean): void {
    this.state.update((currentState) => {
      if (!currentState.category) return currentState;
      const newFollowersCount = currentState.category.followersCount + (isNowFollowing ? 1 : -1);
      return {
        ...currentState,
        category: {
          ...currentState.category,
          followersCount: newFollowersCount,
          isFollowing: isNowFollowing,
        },
      };
    });
  }

  openCommentsModal(threadId: number): void {
    this.dialog.open(Comments, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { threadId: threadId },
      panelClass: 'comments-dialog-container',
    });
  }
}
